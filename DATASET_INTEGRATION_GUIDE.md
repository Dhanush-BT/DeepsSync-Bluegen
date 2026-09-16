# DEEPSYNC Dataset Integration Guide

## Overview
This guide documents the implementation for integrating all available datasets into the DEEPSYNC application for 3D and 2D visualization.

## Available Datasets

### 1. **Argo Floats** (`dataset/SIH 26067/argo`)
- **Format**: NetCDF (CF Convention)
- **Files**: 13+ float deployments with multiple profiles
- **Variables**: temperature, salinity, pressure
- **Visualization**: Profile charts, 2D time-series, trajectory map

### 2. **BGC Floats** (`dataset/SIH 26067/bgc`)
- **Format**: NetCDF (CF Convention)
- **Files**: 80+ Bio-Geo-Chemical profiles
- **Variables**: temperature, salinity, oxygen, nitrate, chlorophyll, pH
- **Visualization**: Biogeochemical profile charts, correlation analysis

### 3. **Gliders** (`dataset/SIH 26067/glider`)
- **Format**: NetCDF trajectories
- **Files**: sea057 deployments (2 missions)
- **Variables**: temperature, salinity, depth, position
- **Visualization**: Trajectory lines, depth profiles, time-series

### 4. **CTD Casts** (`dataset/SIH 26067/ctd`)
- **Format**: NetCDF
- **Files**: Single cast file (ocldb1789015662.272873_CTD.nc)
- **Variables**: temperature, salinity, pressure, depth
- **Visualization**: Single profile, depth dependency

### 5. **IGORA/HYCOM Model** (`dataset/SIH 26067/igora`)
- **Format**: NetCDF + CSV gridded data
- **Variables**: salinity.nc, temp.nc, u.nc (current U), v.nc (current V)
- **Spatial**: Regularly gridded (0.25° resolution)
- **Visualization**: 3D mesh, isosurface, vector field

### 6. **Hazards** (`dataset/SIH 26067/hazards`)
- **Format**: NetCDF (WW3 wave model)
- **Variables**: HS (wave height), T01, T02, PWP, MWD, PWD
- **Visualization**: Hazard overlay on map, alert system

## Backend Implementation

### New Files Created

1. **NetCdfDatasetLoader.java**
   - Universal NetCDF loader using CF Convention metadata
   - Auto-detects instrument type from filename and metadata
   - Extracts profiles, positions, and trajectory data
   - Handles dimension mismatches gracefully

2. **EnhancedDataSeeder.java**
   - Seeds all datasets from `dataset/SIH 26067` directory
   - Auto-skips duplicates by platform ID
   - Provides dataset statistics and availability info
   - Lazy-loads only necessary datasets

3. **DatasetController.java**
   - `/api/datasets` - List available datasets
   - `/api/datasets/stats` - Get statistics for all datasets
   - `/api/datasets/{type}` - Get profiles for specific dataset
   - `/api/datasets/reload` - Trigger reload of datasets

### Database Schema Changes

**ArgoFloatEntity** additions:
- `data_source` (String) - Dataset name (argo, bgc, glider, etc.)
- `dataset_path` (TEXT) - Full path to source file

**ArgoFloatRepository** additions:
- `countByDataSource(String)` - Count profiles by source dataset

## Frontend Implementation

### New Components

1. **DatasetSelector.jsx**
   - Checkbox list of available datasets
   - Real-time file and profile counts
   - Select All / Clear All buttons
   - Dataset descriptions and metadata

2. **Enhanced FloatSelector**
   - Filter by instrument type AND dataset
   - Shows profile count per dataset
   - Supports multi-dataset selection

### Store Updates (useAppStore.js)

```javascript
selectedDatasets: ['argo', 'bgc', 'glider', 'ctd'],
setSelectedDatasets: (datasets) => set({ selectedDatasets: datasets })
```

### Dashboard Modifications

1. **OceanScene.jsx** (3D Dashboard)
   - Add DatasetSelector panel
   - Filter points by selected datasets
   - Color-code by instrument type
   - Support IGORA gridded 3D mesh rendering

2. **FloatSelector.jsx** (2D Charts)
   - Add dataset filter dropdown
   - Filter profile list by selected datasets
   - Show dataset source in UI

3. **Dashboard view**
   - Integrate DatasetSelector in left panel
   - Update data fetching to respect dataset filters
   - Add legend showing active datasets

## Data Pipeline

```
1. Load datasets from disk (on app startup or manual trigger)
   ↓
2. Parse NetCDF files with CF Convention reader
   ↓
3. Extract platform ID, instrument type, profiles, positions
   ↓
4. Save to database with data_source tracking
   ↓
5. Frontend queries with dataset filter
   ↓
6. Render in 3D/2D with color-coding by source
```

## Usage Flow

### For End Users

1. **Startup**: Application auto-loads datasets on boot (via DataSeeder)
2. **Dashboard**: User sees Dataset Selector panel with available datasets
3. **Selection**: Check/uncheck datasets to filter visualization
4. **Charts**: 2D charts update to show selected datasets only
5. **3D**: 3D mesh updated to visualize selected profiles and model data

### For Developers

1. **Add new dataset type**:
   - Add folder to `dataset/SIH 26067/`
   - NetCdfDatasetLoader auto-detects and loads
   - Specify instrument type detection in `detectInstrumentType()`

2. **Customize visualization**:
   - Edit color schemes in FloatSelector
   - Add dataset-specific chart types
   - Extend 3D rendering for new variables

3. **Manual dataset reload**:
   ```bash
   curl -X POST http://localhost:8080/api/datasets/reload
   ```

## Implementation Checklist

### Backend
- [x] Create NetCdfDatasetLoader.java
- [x] Create EnhancedDataSeeder.java
- [x] Create DatasetController.java
- [x] Update ArgoFloatEntity with data_source, dataset_path
- [x] Add countByDataSource() to ArgoFloatRepository
- [ ] Run `./mvnw compile` to verify no errors
- [ ] Update DataSeeder to call EnhancedDataSeeder.seedAllDatasets()
- [ ] Test dataset loading on app startup

### Frontend
- [x] Create DatasetSelector.jsx component
- [x] Update useAppStore.js with selectedDatasets state
- [ ] Integrate DatasetSelector into OceanScene
- [ ] Update FloatSelector to filter by dataset
- [ ] Update chart rendering to filter by dataset
- [ ] Add dataset color legend to dashboard
- [ ] Test filtering and multi-dataset selection

### Testing
- [ ] Verify all 7 dataset types load correctly
- [ ] Check database for correct profile counts per dataset
- [ ] Test dataset filtering in UI
- [ ] Verify 3D mesh renders correctly for IGORA data
- [ ] Check 2D charts filter by dataset properly
- [ ] Test with empty/missing dataset directories
- [ ] Performance test with full dataset (~300+ profiles)

## Performance Considerations

- **Lazy Loading**: Only load datasets when needed
- **Database Indexing**: Add index on `data_source` and `platform_id`
- **Frontend Filtering**: Filter before rendering, not after
- **3D Rendering**: Use Level of Detail (LOD) for large datasets
- **Caching**: Cache dataset statistics in browser

## Future Enhancements

1. **Dynamic Dataset Upload**
   - Admin interface to upload new NetCDF files
   - Real-time validation against CF Convention
   - Automatic ingestion and database storage

2. **Dataset Comparison**
   - Side-by-side visualization of different datasets
   - Statistical comparison tools
   - Anomaly detection

3. **Export Functionality**
   - Export filtered data as CSV/NetCDF
   - Generate publication-ready figures
   - Create subsetting queries

4. **Advanced Filtering**
   - Filter by depth range, time period, variable thresholds
   - Complex boolean queries
   - Spatial bounding box selection

## Troubleshooting

### No datasets appear in UI
1. Check `dataset/SIH 26067` directory exists
2. Verify NetCDF files have proper CF Convention metadata
3. Check server logs for loader errors
4. Run `/api/datasets/reload` endpoint

### Incomplete profile data
1. Verify variable names match CF Convention standard
2. Check NetCDF file has depth/time dimensions
3. Review NetCdfDatasetLoader dimension handling

### 3D mesh doesn't render
1. Ensure IGORA data is in gridded format
2. Check variable names: temp.nc, salinity.nc, u.nc, v.nc
3. Verify grid resolution in vite config

## References

- CF Convention: http://cfconventions.org/
- NetCDF-Java: https://www.unidata.ucar.edu/software/netcdf-java/
- INCOIS Argo: https://www.incois.gov.in/portal/
