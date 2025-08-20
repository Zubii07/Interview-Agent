import { useState } from "react";
import { ResumeService } from "../services/resumeService";

export function useResume() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const upload = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ResumeService.upload(formData);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ResumeService.fetch();
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, upload, fetch };
}
