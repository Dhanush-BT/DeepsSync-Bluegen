-- Add dataset tracking columns to argo_float table
ALTER TABLE argo_float ADD COLUMN IF NOT EXISTS data_source VARCHAR(50);
ALTER TABLE argo_float ADD COLUMN IF NOT EXISTS dataset_path TEXT;

-- Create index for efficient filtering by data source
CREATE INDEX IF NOT EXISTS idx_argo_float_data_source ON argo_float(data_source);
CREATE INDEX IF NOT EXISTS idx_argo_float_platform_id ON argo_float(platform_id);

-- Add comment to document the purpose
COMMENT ON COLUMN argo_float.data_source IS 'Dataset source: argo, bgc, glider, ctd, etc.';
COMMENT ON COLUMN argo_float.dataset_path IS 'Full path to the source NetCDF file';
