import { useState, useEffect, useRef } from "react";
import { getJobStatus } from "../services/api";

export function useJobPoller(jobId) {
    const [status, setStatus] = useState("pending");
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (!jobId) return;

        intervalRef.current = setInterval(async () => {
            try {
                const data = await getJobStatus(jonId);

                setStatus(data.status);

                if (data.status === "done") {
                    setResult(data.result);
                    clearInterval(intervalRef.current);
                }

                if (data.status === "failed") {
                    setError(data.error || "Something went wrong.");
                    clearInterval(intervalRef.current);
                }
            } catch (err) {
                setError("Could not reach server.");
                clearInterval(intervalRef.current);
            }
        }, 3000);

        return () => clearInterval(intervalRef.current);
    }, [jobId]);

    return { status, result, error };
}