import React, { useState, useEffect } from 'react';
import {
  Typography, Button, TextField, CircularProgress,
  List, ListItem, ListItemText, Breadcrumbs, Link, Box,
  Menu, MenuItem, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Tooltip
} from '@mui/material';
import { DragDropContext, Droppable, Draggable, resetServerContext } from 'react-beautiful-dnd';
import FolderIcon from '@mui/icons-material/Folder';
import SearchIcon from '@mui/icons-material/Search';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import RefreshIcon from '@mui/icons-material/Refresh';
import Layout from '../components/Layout';
import { 
  getFolders, createFolder, deleteFolder, 
  moveItem, getHistories, getStorageInfo,
  setDefaultFolder, deleteHistory, renameFolder, renameHistory,
  recalculateStorage
} from '../services/api';
import { useNavigate } from 'react-router-dom';

resetServerContext();

const History = () => {
  const [currentFolder, setCurrentFolder] = useState({ id: null, name: 'My Drive' });
  const [items, setItems] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'My Drive' }]);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState('');
  const [storage, setStorage] = useState({ used: 0, limit: 1024 * 1024 * 1024 });
  const [error, setError] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newName, setNewName] = useState('');
  const [dragOverItem, setDragOverItem] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [storageRes, foldersRes] = await Promise.all([
          getStorageInfo(),
          getFolders('root')
        ]);
        setStorage(storageRes.data);
        setItems(foldersRes.data.map(formatFolder));
        setBreadcrumbs([{ id: null, name: 'My Drive' }]);
      } catch (err) {
        handleError('Initialization failed', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  const formatFolder = (folder) => ({
    ...folder,
    type: 'folder',
    icon: <FolderIcon sx={{ color: '#FFCB05' }} />,
    timestamp: new Date(folder.created_at).toLocaleDateString()
  });

  const handleError = (message, error) => {
    console.error(error);
    setError(`${message}: ${error.response?.data?.error || 'Server error'}`);
    setTimeout(() => setError(null), 5000);
  };

  const loadFolder = async (folderId, folderName) => {
    setLoading(true);
    try {
      const [foldersRes, historiesRes] = await Promise.all([
        getFolders(folderId),
        folderId ? getHistories(folderId) : { data: { histories: [] } }
      ]);
      console.log('Folders:', foldersRes.data);
      console.log('Histories:', historiesRes.data);
      setItems([
        ...foldersRes.data.map(formatFolder),
        ...historiesRes.data.histories.map(history => ({
          ...history,
          type: 'history',
          icon: <InsertDriveFileIcon sx={{ color: '#00274C' }} />,
          timestamp: new Date(history.timestamp).toLocaleDateString(),
          calculation_type: history.calculation_type
        }))
      ]);
      
      setCurrentFolder({ id: folderId, name: folderName });
      setBreadcrumbs(prev => {
        const existingIndex = prev.findIndex(b => b.id === folderId);
  
        const newCrumbs = existingIndex >= 0 ? 
          prev.slice(0, existingIndex + 1) : 
          [...prev, { 
            id: folderId, 
            name: folderName,
            path: [...prev.map(b => b.id), folderId].filter(Boolean)
          }];
      
        console.log('New breadcrumbs:', newCrumbs.map(b => b.id));
        return newCrumbs;
      });
    } catch (err) {
      handleError('Failed to load folder', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const res = await createFolder({
        folderName: newFolderName,
        parentId: currentFolder.id
      });
      
      setItems(prev => [...prev, formatFolder(res.data)]);
      setNewFolderName('');
    } catch (err) {
      handleError('Failed to create folder', err);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragUpdate = (update) => {
    const { combine, destination } = update;
    let targetFolderId = null;
    
    // Handle combine events (dropping on other elements)
    if (combine) {
      const combineId = combine.draggableId || combine.droppableId;
      if (combineId?.startsWith('folder:') || combineId?.startsWith('breadcrumb:')) {
        targetFolderId = combineId.split(':')[1];
      }
    }
    // Handle destination events (dropping in list areas)
    else if (destination?.droppableId?.startsWith('folder:') || destination?.droppableId?.startsWith('breadcrumb:')) {
      targetFolderId = destination.droppableId.split(':')[1];
    }
    
    setDragOverItem(targetFolderId ? { id: targetFolderId } : null);
  };

  const handleDragEnd = async (result) => {
    try {
      const { source, destination, combine, draggableId } = result;
      const [itemType, itemId] = draggableId.split(':');
  
      // Handle dropping on folders or breadcrumbs
      if (combine) {
        const combineId = combine.draggableId || combine.droppableId;
        if (combineId?.startsWith('folder:') || combineId?.startsWith('breadcrumb:')) {
          const targetFolderId = combineId.split(':')[1];
          
          // Prevent self-nesting
          if (itemType === 'folder' && itemId === targetFolderId) {
            console.warn('Cannot move folder into itself');
            return;
          }
  
          // Call move API
          await moveItem(itemId, targetFolderId, itemType);
          console.log(`Moved ${itemType} ${itemId} to folder ${targetFolderId}`);
          
          // Reload items after move
          await loadFolder(currentFolder.id, currentFolder.name);
          return;
        }
      }
  
      // Handle regular list drops
      if (destination) {
        if (destination.droppableId?.startsWith('folder:') || destination.droppableId?.startsWith('breadcrumb:')) {
          const targetFolderId = destination.droppableId.split(':')[1];
          
          // Prevent self-nesting
          if (itemType === 'folder' && itemId === targetFolderId) {
            console.warn('Cannot move folder into itself');
            return;
          }
  
          // Call move API
          await moveItem(itemId, targetFolderId, itemType);
          console.log(`Moved ${itemType} ${itemId} to folder ${targetFolderId}`);
          
          // Reload items after move
          await loadFolder(currentFolder.id, currentFolder.name);
          return;
        }
  
        // Handle reordering within the same list
        if (
          destination.droppableId === source.droppableId &&
          destination.index !== source.index
        ) {
          const reorderedItems = Array.from(items);
          const [movedItem] = reorderedItems.splice(source.index, 1);
          reorderedItems.splice(destination.index, 0, movedItem);
          setItems(reorderedItems);
        }
      }
    } catch (err) {
      handleError('Move operation failed', err);
      loadFolder(currentFolder.id, currentFolder.name); // Reload data
    } finally {
      setIsDragging(false);
      setDragOverItem(null);
    }
  };

  const handleBreadcrumbClick = async (index) => {
    const targetCrumb = breadcrumbs[index];
    const newCrumbs = breadcrumbs.slice(0, index + 1);
    
    try {
      await loadFolder(targetCrumb.id, targetCrumb.name);
      setBreadcrumbs(newCrumbs);
    } catch (err) {
      handleError('Failed to navigate', err);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Are you sure to permanently delete this folder and all its contents?')) return;
    
    try {
      await deleteFolder(folderId);
      setItems(prev => prev.filter(item => item.id !== folderId));
    } catch (err) {
      handleError('Failed to delete folder', err);
    }
  };

  const handleSetDefaultFolder = async (folderId) => {
    try {
      await setDefaultFolder(folderId);
      alert('Default folder set successfully');
    } catch (err) {
      handleError('Failed to set default folder', err);
    }
  };

  // Context Menu Handlers
  const handleRightClick = (event, item) => {
    event.preventDefault();
    setSelectedItem(item);
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4
    });
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    
    const isFolder = selectedItem.type === 'folder';
    const confirmation = isFolder ? 
      'Are you sure to permanently delete this folder and all its contents?' :
      'Are you sure to delete this history record?';
    
    if (!window.confirm(confirmation)) return;

    try {
      if (isFolder) {
        await deleteFolder(selectedItem.id);
      } else {
        await deleteHistory(selectedItem.id);
      }
      setItems(prev => prev.filter(item => item.id !== selectedItem.id));
    } catch (err) {
      handleError('Delete failed', err);
    } finally {
      setContextMenu(null);
    }
  };

  // Rename Handlers
  const handleRename = async () => {
    if (!editingItem || !newName.trim()) return;
    
    try {
      if (editingItem.type === 'folder') {
        await renameFolder(editingItem.id, newName);
      } else {
        await renameHistory(editingItem.id, newName);
      }
      
      setItems(prev => prev.map(item => 
        item.id === editingItem.id ? { ...item, name: newName } : item
      ));
      
      setEditingItem(null);
      setNewName('');
    } catch (err) {
      handleError('Rename failed', err);
    }
  };

  const handleRecalculateStorage = async () => {
    try {
      const response = await recalculateStorage();
      setStorage(response.data);
      setError(null);
    } catch (err) {
      handleError('Failed to recalculate storage', err);
    }
  };

  const renderItem = (item, index) => (
    <Draggable key={`${item.type}:${item.id}`} draggableId={`${item.type}:${item.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          style={{
            ...provided.draggableProps.style,
            marginBottom: 8,
            position: 'static',
          }}
        >
          <div
            {...provided.dragHandleProps}
            style={{
              cursor: 'grab',
              zIndex: 2,
              position: 'relative'
            }}
          >
            <ListItem
              button
              onContextMenu={(e) => handleRightClick(e, item)}
              onDoubleClick={() => {
                if (item.type === 'folder') {
                  loadFolder(item.id, item.name);
                } else if (item.type === 'history') {
                  navigate(`/history/${item.id}`);
                }
              }}
              sx={{
                mb: 1,
                bgcolor: 'background.paper',
                borderRadius: 1,
                boxShadow: 1,
                '&:hover': { bgcolor: 'action.hover' },
                opacity: snapshot.isDragging ? 0.5 : 1,
                transition: 'none',
                ...(dragOverItem?.id === item.id.toString() && {
                  boxShadow: '0 0 0 2px #1976d2',
                  bgcolor: 'rgba(25, 118, 210, 0.1)'
                })
              }}
            >
              {item.icon}
              <ListItemText
                primary={item.name || `${item.calculation_type}_${item.timestamp}_${item.id}`}
                secondary={item.type === 'folder' 
                  ? `${item.children?.length || 0} items` 
                  : item.timestamp}
                sx={{ ml: 2 }}
              />
              {item.type === 'folder' && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetDefaultFolder(item.id);
                  }}
                  sx={{ ml: 2 }}
                >
                  Set as Default
                </Button>
              )}
            </ListItem>
          </div>
  
          {item.type === 'folder' && (
            <Droppable
              droppableId={`folder:${item.id}`}
              isDropDisabled={snapshot.isDragging}
            >
              {(folderProvided, folderSnapshot) => (
                <div
                  ref={folderProvided.innerRef}
                  {...folderProvided.droppableProps}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 32,
                    right: 0,
                    minHeight: 40,
                    zIndex: 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {folderProvided.placeholder}
                </div>
              )}
            </Droppable>
          )}
        </div>
      )}
    </Draggable>
  );

  return (
    <Layout title="File Management" subTitle="Your Cloud Storage">
      {/* Error Message */}
      {error && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'error.light', borderRadius: 2 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}

      {/* Storage Info */}
      <Box sx={{ 
        p: 3, 
        mb: 3, 
        bgcolor: 'background.paper', 
        borderRadius: 2, 
        boxShadow: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h6">
          Storage Usage
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 200, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
            <Box 
              sx={{ 
                height: 8, 
                bgcolor: 'primary.main',
                width: `${(storage.used / storage.limit) * 100}%`,
                transition: 'width 0.3s ease'
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {(storage.used / 1024 / 1024).toFixed(2)}MB / {(storage.limit / 1024 / 1024).toFixed(2)}MB
          </Typography>
          <Tooltip title="Recalculate storage usage">
            <IconButton 
              onClick={handleRecalculateStorage}
              sx={{ 
                color: 'primary.main',
                '&:hover': { 
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  transform: 'rotate(180deg)',
                  transition: 'transform 0.3s ease'
                }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Action Bar */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="New folder name"
            variant="outlined"
            size="small"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            sx={{ width: 200 }}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
          />
          <Button
            variant="contained"
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim()}
            sx={{ 
              bgcolor: '#FFCB05', 
              '&:hover': { bgcolor: '#FFD700' },
              color: '#00274C',
              mr: 2
            }}
          >
            Create Folder
          </Button>
        </Box>
        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={() => navigate('/history/search')}
          sx={{
            bgcolor: '#00274C',
            color: 'white',
            '&:hover': { bgcolor: '#001a33' },
            ml: 2
          }}
        >
          Search by Name
        </Button>
      </Box>

      {/* Breadcrumbs and File List */}
      <DragDropContext 
        onDragEnd={handleDragEnd}
        onDragUpdate={handleDragUpdate}
      >
        <Box sx={{ mb: 2 }}>
          <Breadcrumbs>
            {breadcrumbs.map((crumb, index) => (
              <Droppable
                droppableId={`breadcrumb:${crumb.id}`}
                key={crumb.id || 'root'}
                direction="horizontal"
                isCombineEnabled={true}
                type="BREADCRUMB"
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ 
                      display: 'inline-block', 
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    <Link
                      color={index === breadcrumbs.length - 1 ? 'text.primary' : 'inherit'}
                      onClick={() => handleBreadcrumbClick(index)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { textDecoration: 'underline' },
                        maxWidth: 200,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        p: 1,
                        borderRadius: 1,
                        ...(dragOverItem?.id === crumb.id?.toString() && {
                          backgroundColor: 'rgba(25, 118, 210, 0.1)',
                          boxShadow: '0 0 0 2px #1976d2',
                        }),
                        ...(crumb.id === null && {
                          color: 'inherit',
                          '&:hover': { color: 'primary.main' }
                        })
                      }}
                    >
                      {crumb.name || 'My Drive'}
                    </Link>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </Breadcrumbs>
        </Box>

        <Droppable
          droppableId={currentFolder.id ? `folder:${currentFolder.id}` : 'root'}
          isCombineEnabled={true}
          direction="vertical"
          type="CONTAINER"
        >
          {(provided, snapshot) => (
            <List
              {...provided.droppableProps}
              ref={provided.innerRef}
              sx={{
                minHeight: 400,
                backgroundColor: snapshot.isDraggingOver ? 'rgba(0,0,0,0.05)' : 'inherit',
                transition: 'background-color 0.2s ease',
                position: 'relative',
                '& > *': { position: 'relative' }
              }}
            >
              {items.map(renderItem)}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>

      {/* Navigation Buttons */}
      <Box sx={{ 
        mt: 4, 
        display: 'flex', 
        justifyContent: 'space-between', 
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => loadFolder(null, 'My Drive')}
          sx={{ mr: 2 }}
        >
          Back to Root
        </Button>

        {breadcrumbs.length > 1 && (
          <Button
            variant="contained"
            onClick={() => {
              const parentBreadcrumb = breadcrumbs[breadcrumbs.length - 2];
              setBreadcrumbs(prev => prev.slice(0, -1));
              loadFolder(parentBreadcrumb.id, parentBreadcrumb.name);
            }}
            sx={{
              bgcolor: '#00274C',
              color: 'white',
              '&:hover': { bgcolor: '#001a33' }
            }}
          >
            Back to Parent
          </Button>
        )}
      </Box>
    </Layout>
  );
};

export default History;