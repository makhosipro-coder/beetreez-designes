self.onmessage = (e) => {
  const { dataUrl, id, maxDim } = e.data;
  const img = new Image();
  img.onload = () => {
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (maxDim && (w > maxDim || h > maxDim)) {
      const ratio = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }
    const canvas = new OffscreenCanvas(w, h);
    const ctx = canvas.getContext('2d');
    if (!ctx) { self.postMessage({ id, error: 'Could not get context' }); return; }
    ctx.drawImage(img, 0, 0, w, h);
    canvas.convertToBlob({ type: 'image/webp', quality: 0.8 }).then((blob) => {
      const reader = new FileReader();
      reader.onload = () => self.postMessage({ id, dataUrl: reader.result });
      reader.readAsDataURL(blob);
    });
  };
  img.onerror = () => self.postMessage({ id, error: 'Decode failed' });
  img.src = dataUrl;
};
