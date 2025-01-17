import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TextField, CircularProgress, Typography, Box, Table, TableBody, TableCell, TableContainer, TableRow, Paper } from "@mui/material";
import CustomButton from "../components/CustomButton";
import { invokeFunction, describeFunction } from "../services/api";
import Layout from "../components/Layout";
import { Line } from "react-chartjs-2";
import { CategoryScale, LinearScale, LineElement, PointElement, LineController, Chart } from "chart.js";

Chart.register(CategoryScale, LinearScale, LineElement, PointElement, LineController);

const FunctionInvoke = () => {
  const { functionName } = useParams();
  const [parameters, setParameters] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const response = await describeFunction(functionName);
        if (response.data.success && response.data.parameters) {
          setParameters(response.data.parameters);
          setValues(
            response.data.parameters.reduce((acc, param) => {
              acc[param.name] = param.default !== null ? param.default : "";
              return acc;
            }, {})
          );
        } else {
          setError(response.data.error || "No parameters found.");
        }
      } catch (err) {
        setError("Failed to fetch parameter information.");
      }
    };

    fetchParameters();
  }, [functionName]);

  const handleChange = (paramName, value) => {
    setValues({ ...values, [paramName]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await invokeFunction(functionName, values);
      if (response.data.success) {
        const resultData = response.data.result;

        // 自动解析结果的类型并存储
        if (Array.isArray(resultData) && resultData.length > 0) {
          // 判断是否为图表数据
          if (resultData.length === 3 && Array.isArray(resultData[0]) && Array.isArray(resultData[1])) {
            setResult({
              type: "chart",
              data: {
                labels: resultData[0],
                datasets: [
                  {
                    label: "Dataset",
                    data: resultData[1],
                    borderColor: "blue",
                    backgroundColor: "lightblue",
                  },
                ],
              },
              loss: resultData[2],
            });
          } else {
            // 如果是二维数组，则展示为表格
            setResult({
              type: "table",
              data: resultData,
            });
          }
        } else {
          // 处理为普通文本结果
          setResult({
            type: "text",
            data: resultData,
          });
        }
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.error || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title={`Invoke Function`} subTitle={`Function: ${functionName}`}>
      {error && (
        <Typography color="error" sx={{ marginBottom: "10px", textAlign: "center" }}>
          {error}
        </Typography>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, alignItems: "center" }}>
          {parameters.length > 0 ? (
            parameters.map((param) => (
              <TextField
                key={param.name}
                label={param.name}
                value={values[param.name] || ""}
                onChange={(e) => handleChange(param.name, e.target.value)}
                required={param.default === null}
                fullWidth
              />
            ))
          ) : (
            <Typography>No parameters to display.</Typography>
          )}

          <CustomButton type="submit" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Invoke"}
          </CustomButton>
        </Box>
      </form>

      {result !== null && (
        <Box sx={{ marginTop: "20px", textAlign: "center" }}>
          {result.type === "text" && (
            <>
              <Typography variant="h6">Result:</Typography>
              <Typography>{JSON.stringify(result.data)}</Typography>
            </>
          )}
          {result.type === "table" && (
            <TableContainer component={Paper} sx={{ marginTop: "20px" }}>
              <Table>
                <TableBody>
                  {result.data.map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {result.type === "chart" && (
            <Box sx={{ margin: "20px auto", width: "900px", height: "600px", textAlign: "center" }}>
              <Typography variant="h6" sx={{ marginBottom: "20px" }}>
                Loss Value: {result.loss}
              </Typography>
              <Line
                data={result.data}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </Box>
          )}
        </Box>
      )}
    </Layout>
  );
};

export default FunctionInvoke;
