import React from 'react';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

const Heatmap = ({ data, metadata, config }) => {
  if (!data || !metadata) {
    console.log('Heatmap: Missing data or metadata', { data, metadata });
    return null;
  }

  // Ensure data is in the correct format
  const zData = Array.isArray(data) ? data : [];
  
  // Calculate min and max from the actual data
  const flatData = zData.flat();
  const computedZmin = Math.min(...flatData);
  const computedZmax = Math.max(...flatData);

  console.log('Heatmap: Data stats', {
    rows: zData.length,
    cols: zData[0]?.length,
    min: computedZmin,
    max: computedZmax,
    sample: zData[0]?.slice(0, 5)
  });

  return (
    <Plot
      data={[{
        z: zData,
        type: 'heatmap',
        colorscale: config?.colorscale || [
          [0, 'rgb(0,0,255)'],
          [0.5, 'rgb(255,255,255)'],
          [1, 'rgb(255,0,0)']
        ],
        zmin: config?.zmin ?? computedZmin,
        zmax: config?.zmax ?? computedZmax,
        showscale: true,
        hoverongaps: false,
        xgap: 1,
        ygap: 1,
        transpose: config?.origin === 'lower',
        hoverinfo: 'z'
      }]}
      layout={{
        width: 1200,
        height: 600,
        margin: { t: 30, b: 40 },
        xaxis: { 
          scaleanchor: 'y',
          title: 'X Axis',
          showgrid: false,
          zeroline: false
        },
        yaxis: {
          title: 'Y Axis',
          showgrid: false,
          zeroline: false
        },
        plot_bgcolor: 'rgba(0,0,0,0.1)',
        paper_bgcolor: 'rgba(0,0,0,0)'
      }}
      config={{
        staticPlot: false,
        displayModeBar: true,
        responsive: true
      }}
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default Heatmap;
