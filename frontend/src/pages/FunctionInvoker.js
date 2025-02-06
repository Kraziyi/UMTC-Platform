import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TextField, CircularProgress, Typography, Box } from "@mui/material";
import CustomButton from "../components/CustomButton";
import { invokeFunction, describeFunction } from "../services/api";
import Layout from "../components/Layout";
import { Line } from "react-chartjs-2";
import { CategoryScale, LinearScale, LineElement, PointElement, LineController, Chart } from "chart.js";

// 注册 Chart.js 组件
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

        if (resultData.type === "chart") {
          const { x_axis, y_axis } = resultData.data;
          setResult({
            type: "chart",
            data: {
              labels: x_axis,
              datasets: [
                {
                  label: y_axis,
                  data: y_axis,
                  borderColor: "blue",
                  backgroundColor: "lightblue",
                },
              ],
            },
            metadata: resultData.metadata,
          });
        } else if (resultData.type === "text") {
          setResult({
            type: "text",
            data: resultData.data,
            metadata: resultData.metadata,
          });
        } else {
          setError("Unsupported result type.");
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
        <Box sx={{ marginTop: "20px", marginBottom: "60px", textAlign: "center" }}>
          {result.type === "chart" && (
            <Box sx={{ margin: "20px auto", width: "900px", height: "600px" }}>
              <Typography variant="h6" sx={{ marginBottom: "20px" }}>
                {result.metadata.description || "Chart Data"}
              </Typography>
              <Typography variant="body1" sx={{ marginBottom: "20px" }}>
                Loss Value: {result.metadata.loss_value}
              </Typography>
              <Line data={result.data} options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { title: { display: true, text: result.metadata.x_label } },
                  y: { title: { display: true, text: result.metadata.y_label } },
                },
              }} />
            </Box>
          )}

          {result.type === "text" && (
            <Box sx={{ margin: "20px auto", textAlign: "center" }}>
              <Typography variant="h6" sx={{ marginBottom: "20px" }}>
                {result.metadata.description || "Text Result"}
              </Typography>
              <Typography>{result.data}</Typography>
            </Box>
          )}
        </Box>
      )}
    </Layout>
  );
};

export default FunctionInvoke;