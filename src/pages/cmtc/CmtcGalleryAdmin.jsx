import React, { useEffect, useMemo, useRef, useState } from "react";
import swal from "sweetalert";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  Button,
  MenuItem,
  TextField,
  Chip,
  Stack,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RefreshIcon from "@mui/icons-material/Refresh";
import PhotoIcon from "@mui/icons-material/Photo";
import MovieIcon from "@mui/icons-material/Movie";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  getCmtcGallery,
  uploadCmtcGalleryImageSingle,
  uploadCmtcGalleryImagesBulk,
  uploadCmtcGalleryVideo,
} from "../../services/cmtcCenterService";

// ✅ Customize image-name dropdown options
const IMAGE_NAME_OPTIONS = [
  { key: "मुख्य_बाहरी_भवन", label: "मुख्य बाहरी भवन" },
  { key: "प्रशिक्षण_कक्ष", label: "प्रशिक्षण कक्ष" },
  { key: "आवास_कक्ष", label: "आवास कक्ष" },
  { key: "कार्यालय_कक्ष", label: "कार्यालय कक्ष" },
  { key: "पुस्तकालय_कक्ष", label: "पुस्तकालय कक्ष" },
  { key: "माँ_का_आँचल", label: "माँ का आँचल" },
  { key: "बगीचा", label: "बगीचा" },
  { key: "मैदान", label: "मैदान" },
  { key: "प्रदर्शन_केंद्र", label: "प्रदर्शन केंद्र" },
  { key: "वाद्य_यंत्र_सामग्री", label: "वाद्य यंत्र सामग्री" }, //
  { key: "खेल_सामग्री", label: "खेल सामग्री" },
  { key: "भोजन_कक्ष", label: "भोजन करने का कक्ष" }, //
  { key: "जनरेटर", label: "जनरेटर" },
  { key: "भोजन_मेनू_चार्ट", label: "भोजन मेनू चार्ट" },
  { key: "अग्निशमन_यंत्र", label: "अग्निशमन यंत्र" },
  { key: "RO_पानी", label: "RO पानी" },
  { key: "LED_TV", label: "LED TV" },
  { key: "LCD_प्रोजेक्टर", label: "LCD प्रोजेक्टर" },
  { key: "CCTV_कैमरा", label: "CCTV कैमरा" },
  { key: "LIB1", label: "अजीविका पुस्तकालय 1" },
  { key: "LIB2", label: "अजीविका पुस्तकालय 2" },
];


const makeRows = () =>
  Array.from({ length: IMAGE_NAME_OPTIONS.length }).map((_, i) => ({
    priorityNo: i + 1,
    imageNameKey: IMAGE_NAME_OPTIONS[i]?.key || "", // ✅ prefilled dropdown
    file: null,
    previewUrl: "", // local preview OR server URL
    uploading: false,
  }));


const absFileUrl = (filePath) => {
  if (!filePath) return "";
  if (typeof filePath !== "string") return "";
  if (filePath.startsWith("http")) return filePath;

  const backendBase = import.meta.env.VITE_APP_BACKEND_URL;

  let path = filePath.startsWith("/") ? filePath : `/${filePath}`;
  if (!backendBase) return path;

  return `${backendBase}${path}`;
};

export default function CmtcGalleryAdmin({ centerId }) {
  const { t} = useTranslation();
  const [galleryType, setGalleryType] = useState("IMAGES"); // IMAGES | VIDEO
  const [rows, setRows] = useState(makeRows());
  const [loadingExisting, setLoadingExisting] = useState(false);

  // video states
  const [videoTitle, setVideoTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [videoDuration, setVideoDuration] = useState(null);
  const [videoUploading, setVideoUploading] = useState(false);
// ADD THIS
const [videoLoading, setVideoLoading] = useState(false);
const [loadingProgress, setLoadingProgress] = useState(0);

  const singleInputRefs = useRef({});
  const videoInputRef = useRef(null);

  const selectedCount = useMemo(() => rows.filter((r) => r.imageNameKey && r.file).length, [rows]);

  useEffect(() => {
    return () => {
      rows.forEach((r) => {
        if (r.previewUrl && r.previewUrl.startsWith("blob:")) URL.revokeObjectURL(r.previewUrl);
      });
      if (videoPreviewUrl?.startsWith("blob:")) URL.revokeObjectURL(videoPreviewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (centerId) {
      loadExisting(centerId);
    } else {
      setRows(makeRows());
      setGalleryType("IMAGES");
      setVideoTitle("");
      setVideoFile(null);
      setVideoPreviewUrl("");
      setVideoDuration(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerId]);

  const setRow = (idx, patch) => {
    setRows((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  };

  const isRowEnabled = (idx) => {
    for (let i = 0; i < idx; i++) {
      const ok = rows[i].imageNameKey && (rows[i].file || rows[i].previewUrl);
      if (!ok) return false;
    }
    return true;
  };

  const loadExisting = async (cid) => {
    if (!cid) return;
    setLoadingExisting(true);

    try {
      const res = await getCmtcGallery(cid);
      const data = res?.data || {};

      const next = makeRows();
      (data.images || []).forEach((img) => {
        const idx = (img.priorityNo || 0) - 1;
        if (idx >= 0 && idx < IMAGE_NAME_OPTIONS.length ) {
          next[idx].imageNameKey = img.imageNameKey || "";
          next[idx].previewUrl = absFileUrl(img.filePath);
          next[idx].file = null;
        }
      });
      setRows(next);

      if (data.video) {
        setVideoTitle(data.video.title || "");
        setVideoPreviewUrl(absFileUrl(data.video.filePath));
        setVideoDuration(data.video.durationSeconds || null);
        setVideoFile(null);
      } else {
        setVideoTitle("");
        setVideoPreviewUrl("");
        setVideoDuration(null);
        setVideoFile(null);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load existing gallery");
    } finally {
      setLoadingExisting(false);
    }
  };

  const uploadSingle = async (idx) => {
    if (!centerId) return toast.warn("Select CMTC Center first.");

    const r = rows[idx];
    if (!r.imageNameKey) return toast.warn(`Select Image Name for Priority ${r.priorityNo}`);
    if (!r.file) return toast.warn(`Select image file for Priority ${r.priorityNo}`);

    setRow(idx, { uploading: true });
    try {
      await uploadCmtcGalleryImageSingle(centerId, r.priorityNo, r.imageNameKey, r.file);
      toast.success(`Priority ${r.priorityNo} uploaded successfully`);
      await loadExisting(centerId);
      setRow(idx, { file: null });
      if (singleInputRefs.current[idx]) singleInputRefs.current[idx].value = "";
    } catch (e) {
      toast.error(e?.response?.data?.message || "Image upload failed");
    } finally {
      setRow(idx, { uploading: false });
    }
  };

  const uploadAll = async () => {
    if (!centerId) return toast.warn("Select CMTC Center first.");

    const items = [];
    const files = [];

    rows.forEach((r) => {
      if (r.imageNameKey && r.file) {
        const fileIndex = files.length;
        files.push(r.file);
        items.push({ priorityNo: r.priorityNo, imageNameKey: r.imageNameKey, fileIndex });
      }
    });

    if (items.length === 0) return toast.warn("Select at least one row with Image Name + File.");

    try {
      await uploadCmtcGalleryImagesBulk(centerId, items, files);
      toast.success(`Uploaded ${items.length} image(s) successfully`);
      await loadExisting(centerId);

      setRows((prev) => prev.map((r) => ({ ...r, file: null })));
      Object.values(singleInputRefs.current).forEach((el) => el && (el.value = ""));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Bulk upload failed");
    }
  };

  const onPickVideo = (file) => {
  if (!file) return;

  setVideoLoading(true);      
  setLoadingProgress(0);    

  let progress = 0;
  const interval = setInterval(() => {
    progress += 1;
    if (progress > 100) {
      clearInterval(interval);
    } else {
      setLoadingProgress(progress);
    }
  }, 40);


  const maxSize = 20 * 1024 * 1024; 

  if (file.size > maxSize) {
      swal({
        text: "Video must be less than 20MB",
        icon: "warning",
      });
    setVideoLoading(false);  
    clearInterval(interval); 
    return;
  }

  if (videoPreviewUrl?.startsWith("blob:")) 
    URL.revokeObjectURL(videoPreviewUrl);

  setVideoFile(file || null);
  // setVideoPreviewUrl(file ? URL.createObjectURL(file) : "");
  setVideoDuration(null);
};


 const onVideoMeta = (e) => {
  const dur = Math.round(e.target.duration || 0);
  setVideoDuration(dur);
  setLoadingProgress(100);
  setTimeout(() => {
    setVideoLoading(false);
  }, 300);
};


  const uploadVideo = async () => {
    if (!centerId) return toast.warn("Select CMTC Center first.");
    if (!videoFile) return toast.warn("Choose a video file.");
    // if (!videoDuration) return toast.warn("Wait for video duration to load.");
    // if (videoDuration > 120) return toast.error("Video must be max 2 minutes (120 seconds).");

    setVideoUploading(true);
    try {
      await uploadCmtcGalleryVideo(centerId, videoTitle, 1, videoFile);
      toast.success("Video uploaded successfully");
      await loadExisting(centerId);
      setVideoFile(null);
      if (videoInputRef.current) videoInputRef.current.value = "";
    } catch (e) {
      console.log(e)
      toast.error(e?.response?.data?.message || "Video upload failed");
    } finally {
      setVideoUploading(false);
    }
  };

  const clearRowFile = (idx) => {
    const r = rows[idx];
    if (r.previewUrl?.startsWith("blob:")) URL.revokeObjectURL(r.previewUrl);
    setRow(idx, { file: null, previewUrl: r.previewUrl && !r.previewUrl.startsWith("blob:") ? r.previewUrl : "" });
    if (singleInputRefs.current[idx]) singleInputRefs.current[idx].value = "";
  };

  const TopRight = (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="nowrap" justifyContent="flex-end">
      <Chip
        icon={galleryType === "IMAGES" ? <PhotoIcon /> : <MovieIcon />}
        label={galleryType === "IMAGES" ? t("cmtc_gallery_mng.image") : t("cmtc_gallery_mng.video")}
        color={galleryType === "IMAGES" ? "primary" : "secondary"}
        variant="outlined"
      />

      <TextField
        select
        size="small"
        value={galleryType}
        onChange={(e) => setGalleryType(e.target.value)}
        sx={{ minWidth: 260 }}
        label={t("cmtc_gallery_mng.mode")}
        InputLabelProps={{ shrink: true }}
      >
        <MenuItem value="IMAGES">{t("cmtc_gallery_mng.modeOption1")}</MenuItem>
        <MenuItem value="VIDEO">{t("cmtc_gallery_mng.modeOption2")}</MenuItem>
      </TextField>

      <Button
        variant="outlined"
        startIcon={<RefreshIcon  />}
        onClick={() => loadExisting(centerId)}
        disabled={!centerId || loadingExisting}
        sx={{fontSize:"14px"}}
      >
        {loadingExisting ? t("cmtc_gallery_mng.loading") : t("cmtc_gallery_mng.load")}
      </Button>
    </Stack>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 3,
        border: "1px solid grey",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
      >
        <Box>
         <Typography
            variant="h6"
            component="h6"
            sx={{
              fontWeight: 600,
              letterSpacing: "0.5px",
              mb: 1,
              fontSize:"16px"
            }}
          >
          {t("cmtc_gallery_mng.galleryManagement")}
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.3,fontSize:"14px" }}>
          {t("cmtc_gallery_mng.galleryTitle")}
          </Typography>
        </Box>
        {TopRight}
      </Stack>

      <Divider sx={{ my: 2 }} />

      {galleryType === "IMAGES" && (
        <Box>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
            sx={{ mb: 1.5}}
          >
            <Typography sx={{ fontWeight: 600 ,fontSize :"16px"}}>
                {t("cmtc_gallery_mng.title2")} <span style={{ color: "#6b7280" }}>(1 → 10)</span>
            </Typography>

            <Button
              variant="contained"
              startIcon={<CloudUploadIcon />}
              onClick={uploadAll}
              disabled={!centerId || selectedCount === 0}
              sx={{ fontWeight: 600 }}
            >
             {t("cmtc_gallery_mng.uploadAllSelected")}({selectedCount})
            </Button>
          </Stack>

          {/* STRICT: ONE PRIORITY = ONE ROW */}
          <Stack spacing={1.4}>
            {rows.map((r, idx) => {
              // const enabled = isRowEnabled(idx);
              // const hasAny = Boolean(r.imageNameKey && (r.file || r.previewUrl));
              // const disabledReason = !enabled ? "Fill previous priority first" : !centerId ? "Select center first" : "";

              const enabled = true; // always enabled
              const hasAny = Boolean(r.imageNameKey && (r.file || r.previewUrl));

              return (
                <Card
                  key={r.priorityNo}
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    borderColor: hasAny ? "rgba(46, 125, 50, 0.35)" : "divider",
                    bgcolor: enabled ? "#ffffff" : "#fafafa",
                    overflow: "hidden",
                  }}
                >
                  {r.uploading && <LinearProgress />}

                  <CardContent sx={{ p: { xs: 1.5, md: 1.8 } }}>
                    {/* Fixed layout: 2 columns only */}
                    <Grid container spacing={1.5} alignItems="stretch">
                      {/* LEFT: all controls */}
                      <Grid item xs={12} md={10} size={10}>
                        <Grid container spacing={1.2} alignItems="center">
                          <Grid item size={{ xs: 6, md: 2 }}>
                        <Stack spacing={0.3}>
                          <Typography sx={{ fontSize:"14px"}}>
                            {t("cmtc_gallery_mng.priority")}{r.priorityNo} 
                          </Typography>
                          <Typography sx={{ fontSize: "14px", color: "text.secondary" }}>
                            {enabled ? "Ready" : `Locked • ${disabledReason}`}
                          </Typography>
                        </Stack>
                      </Grid>

                      <Grid item size={{ xs: 6, md: 3 }}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label={t("cmtc_gallery_mng.imageName")}
                          InputLabelProps={{ shrink: true }}
                          value={r.imageNameKey}
                          onChange={(e) => setRow(idx, { imageNameKey: e.target.value })}
                          disabled={!centerId || !enabled}
                        >
                          <MenuItem value="">
                            <em>{t("cmtc_gallery_mng.selectImageName")}</em>
                          </MenuItem>
                          {IMAGE_NAME_OPTIONS.map((o) => (
                            <MenuItem key={o.key} value={o.key}>
                              {o.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>


                      <Grid itemsize={{ xs: 6, md: 3 }}>
                        <input
                          ref={(el) => (singleInputRefs.current[idx] = el)}
                          type="file"
                          accept="image/*"
                          hidden
                          disabled={!centerId || !enabled}
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null;

                            if (rows[idx].previewUrl?.startsWith("blob:")) {
                              URL.revokeObjectURL(rows[idx].previewUrl);
                            }

                            setRow(idx, {
                              file: f,
                              previewUrl: f ? URL.createObjectURL(f) : rows[idx].previewUrl,
                            });
                          }}
                        />

                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Button
                            variant="outlined"
                            startIcon={<UploadFileIcon />}
                            onClick={() => singleInputRefs.current[idx]?.click()}
                            disabled={!centerId || !enabled}
                            sx={{ whiteSpace: "nowrap" }}
                          >
                            {t("cmtc_gallery_mng.chooseImage")}
                          </Button>

                          <Typography
                            sx={{
                              fontSize: "14px",
                              color: "text.secondary",
                              maxWidth: 220,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={r.file?.name || ""}
                          >
                            {r.file?.name || t("cmtc_gallery_mng.noChosenFile")}
                          </Typography>

                          {(r.file || r.previewUrl?.startsWith("blob:")) && (
                            <Tooltip title="Clear selected file">
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() => clearRowFile(idx)}
                                  disabled={!centerId || !enabled}
                                >
                                  <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          )}
                        </Stack>

                      </Grid>
                      <Grid item size={{ xs: 6, md: 3 }}>
                        <Tooltip
                          title={
                            !r.file
                              ? "Select a file first"
                              : enabled
                              ? "Upload this image"
                              : disabledReason
                          }
                        >
                          <span>
                            <Button
                              variant="contained"
                              fullWidth
                              onClick={() => uploadSingle(idx)}
                              disabled={!centerId || !enabled || r.uploading || !r.file}
                              startIcon={<CloudUploadIcon />}
                              sx={{ whiteSpace: "nowrap" }}
                            >
                              {r.uploading ? t("cmtc_gallery_mng.uploading") : t("cmtc_gallery_mng.upload")}
                            </Button>
                          </span>
                        </Tooltip>
                      </Grid>

                        </Grid>
                      </Grid>

                      {/* RIGHT: preview thumbnail (fixed) */}
                      <Grid item size={{ xs: 6, md: 2 }}>
                        <Box
                          sx={{
                            width: { xs: 90, md: 86 },
                            height: { xs: 90, md: 86 },
                            ml: { xs: 0, md: "auto" },
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "#f7f8fb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                          }}
                        >
                          {r.previewUrl ? (
                            <img
                              src={r.previewUrl}
                              alt="preview"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <PhotoIcon sx={{ color: "rgba(0,0,0,0.25)" }} />
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>
      )}

      {galleryType === "VIDEO" && (
        <Box>
          <Typography sx={{ fontSize:"16px" , fontWeight: 600, mb: 1.2 }}>
           {t("cmtc_gallery_mng.uploadCenterVideo")} <span style={{ color: "#6b7280" ,fontSize:"14px" }}>(max 5 minutes)</span>
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item size={{ xs: 6, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                label={t("cmtc_gallery_mng.videoLabel")}
                InputLabelProps={{ shrink: true }}
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                disabled={!centerId}
              />
            </Grid>

            <Grid item size={{ xs: 6, md: 4 }}>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                disabled={!centerId}
                onChange={(e) => onPickVideo(e.target.files?.[0])}
              />

              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Button
                  variant="outlined"
                  startIcon={<UploadFileIcon />}
                  onClick={() => videoInputRef.current?.click()}
                  disabled={!centerId}
                >
                 {t("cmtc_gallery_mng.chooseVideo")}
                </Button>

                <Typography
                  sx={{
                    fontSize: 12.5,
                    color: "text.secondary",
                    maxWidth: 360,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={videoFile?.name || ""}
                >
                  {videoFile?.name ? videoFile.name : t("cmtc_gallery_mng.noChosenFile")}
                </Typography>

                {/* <Chip
                  size="small"
                  label={`Duration: ${videoDuration ? `${videoDuration}s` : "—"} / 300s`}
                  color={videoDuration && videoDuration > 300 ? "error" : "default"}
                  variant="outlined"
                  sx={{ fontWeight: 800 }}
                /> */}
              </Stack>

              <Typography sx={{ fontSize: "12px", color: "text.secondary", mt: 0.6 }}>
                {t("cmtc_gallery_mng.videoTip")}
              </Typography>
              {/* video loader */}
                {videoLoading && (
                  <Grid item xs={12}>
                    <Box sx={{ mt: 1, width: "100%" }}>
                      <LinearProgress
                        variant="determinate"
                        value={loadingProgress}
                        sx={{ height: 6, borderRadius: 5 }}
                      />
                      <Typography sx={{ fontSize: 12, mt: 0.5 }}>
                        Progress: {loadingProgress}%
                      </Typography>
                    </Box>
                  </Grid>
                )}
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={uploadVideo}
                disabled={!centerId || videoUploading}
                
              >
                {videoUploading ? t("cmtc_gallery_mng.uploading") : t("cmtc_gallery_mng.upload")}
              </Button>
            </Grid>
          </Grid>


          {videoPreviewUrl && (
            <Box sx={{ mt: 2 }}>
              {videoUploading && <LinearProgress sx={{ mb: 1 }} />}
              <Box
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                  bgcolor: "#000",
                  maxWidth: 900,
                }}
              >
                <video
                  src={videoPreviewUrl}
                  controls
                  onLoadedMetadata={onVideoMeta}
                  style={{ width: "100%", display: "block",height:"350px" }}
                />
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}

