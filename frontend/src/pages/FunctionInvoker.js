import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TextField, CircularProgress, Typography, Box } from "@mui/material";
import CustomButton from "../components/CustomButton";
import { invokeFunction, describeFunction } from "../services/api";
import Layout from "../components/Layout";

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
      console.log(response);
      if (response.data.success) {
        setResult(response.data.result);
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
          <Typography variant="h6">Result:</Typography>
          <Typography>{JSON.stringify(result)}</Typography>
        </Box>
      )}
    </Layout>
  );
  
};

export default FunctionInvoke;
