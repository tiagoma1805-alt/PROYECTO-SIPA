// src/core/hooks/useFilePdfUpload.js
import { useRef, useState } from 'react';
import { validarPdf } from '@/core/utils/validarPdf';

export const useFilePdfUpload = (maxMB = 5) => {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const onSelect = async (event) => {
    const f = event.target?.files?.[0];
    if (!f) {
      setFile(null);
      setError(null);
      return;
    }

    const r = await validarPdf(f, maxMB);
    if (!r.ok) {
      setFile(null);
      setError(r.msg);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setFile(f);
    setError(null);
  };

  const reset = () => {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return { file, error, inputRef, onSelect, reset };
};