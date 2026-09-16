# Dataset Integration - Implementation Checklist

## ✅ **Backend Implementation Status**

### Files Created
- [x] `src/main/java/com/bluegen/deepsyncapp/ingestion/NetCdfDatasetLoader.java` - Universal NetCDF loader
- [x] `src/main/java/com/bluegen/deepsyncapp/config/EnhancedDataSeeder.java` - Smart dataset seeder
- [x] `src/main/java/com/bluegen/deepsyncapp/controller/DatasetController.java` - REST API endpoints
- [x] `src/main/resources/db/migration/V2__Add_Dataset_Tracking.sql` - Database migration

### Files Modified
- [x] `src/main/java/com/bluegen/deepsyncapp/entity/ArgoFloatEntity.java`
  - Added `data_source` field
  - Added `dataset_path` field
  - Added getters/setters
  
- [x] `src/main/java/com/bluegen/deepsyncapp/repository/ArgoFloatRepository.java`
  - Added `countByDataSource(String)` method
  
- [x] `src/main/java/com/bluegen/deepsyncapp/config/DataSeeder.java`
  - Added `EnhancedDataSeeder` dependency
  - Added `seedAllDatasets()` call to `run()` method
  
- [x] `src/main/java/com/bluegen/deepsyncapp/controller/OceanDataController.java`
  - Added `dataset` parameter to `/api/ocean-data` endpoint
  - Added call to `findPointsByDatasets()`
  
- [x] `src/main/java/com/bluegen/deepsyncapp/service/OceanDataService.java`
  - Added `findPointsByDatasets()` method
  - Added ArrayList import

### Frontend Implementation Status

#### Components Created
- [x] `frontend/src/components/dashboard3d/DatasetSelector.jsx` - Dataset selector UI

#### Files Modified
- [x] `frontend/src/store/useAppStore.js`
  - Added `selectedDatasets` state
  - Added `setSelectedDatasets` setter
  
- [x] `frontend/src/components/dashboard3d/OceanScene.jsx`
  - Added DatasetSelector import
  - Added `selectedDatasets`, `setSelectedDatasets` from store
  - Updated data fetching to include dataset filter
  
- [x] `frontend/src/views/Dashboard.jsx`
  - Added DatasetSelector import
  - Added `selectedDatasets`, `setSelectedDatasets` to store destructuring
  - (Need to integrate DatasetSelector in JSX - see Frontend Integration section)

## 📋 **Remaining Tasks**

### Backend Compilation & Testing
```bash
# 1. Compile backend
cd D:\SIH\DEEPSYNC\DEEPSYNC-APP
./mvnw clean compile -DskipTests

# 2. Run backend
./mvnw spring-boot:run

# 3. Test endpoints
curl http://localhost:8080/api/datasets
curl http://localhost:8080/api/datasets/stats
curl http://localhost:8080/api/datasets/reload
```

### Frontend Integration (TODO)
- [ ] Integrate DatasetSelector into Dashboard.jsx control panel
- [ ] Add dataset filtering to FloatSelector.jsx
- [ ] Update 2D charts to respect `selectedDatasets`
- [ ] Test dataset selection in UI
- [ ] Verify chart updates on dataset change

### Database Migration
- [ ] Run migration: `./mvnw flyway:migrate`
- [ ] Or manually execute V2__Add_Dataset_Tracking.sql

### Data Loading Testing
- [ ] Verify datasets load on app startup
- [ ] Check database for profiles from each dataset:
  ```sql
  SELECT data_source, COUNT(*) FROM argo_float GROUP BY data_source;
  ```
- [ ] Test dataset filtering via `/api/datasets/{type}`

### Frontend Testing
- [ ] Check DatasetSelector displays all datasets
- [ ] Verify profile/file counts are accurate
- [ ] Test Select All / Clear All buttons
- [ ] Test individual dataset toggling
- [ ] Verify 3D visualization updates on selection change
- [ ] Verify 2D charts filter by dataset

## 🚀 **Deployment Steps**

### 1. Backend Deployment
```bash
# Build backend
./mvnw clean package -DskipTests

# Run with datasets enabled
java -jar target/DEEPSYNC-APP-0.0.1-SNAPSHOT.jar
```

### 2. Frontend Deployment
```bash
cd frontend
npm run build
npm run preview
```

### 3. Database Setup
- Ensure PostgreSQL is running
- Migration V2 will auto-run on app startup (Flyway)

## 🔍 **Verification Checklist**

### Backend
- [ ] Application starts without errors
- [ ] `/api/datasets` returns list of available datasets
- [ ] `/api/datasets/stats` shows file and profile counts
- [ ] Each dataset type shows non-zero profile count
- [ ] `/api/ocean-data?dataset=argo` filters correctly
- [ ] Database tables have new columns with data

### Frontend
- [ ] Home page loads without errors
- [ ] Dashboard loads 3D scene
- [ ] DatasetSelector component renders in control panel
- [ ] Checkboxes allow selecting/deselecting datasets
- [ ] Select All / Clear All buttons work
- [ ] 3D mesh updates when datasets change
- [ ] 2D charts show correct dataset counts

### Data Quality
- [ ] No duplicate profiles in database
- [ ] Profile counts match file counts (approximately)
- [ ] Coordinates are within expected ocean boundaries
- [ ] Temperature and salinity values are realistic (0-30°C, 30-40 PSU)

## 📊 **Expected Dataset Counts**

After successful seeding, you should see approximately:

| Dataset | Expected Profiles | Location |
|---------|-----------------|----------|
| Argo | 13+ | dataset/SIH 26067/argo/files |
| BGC | 80+ | dataset/SIH 26067/bgc/raw |
| Glider | 2 | dataset/SIH 26067/glider/raw |
| CTD | 1 | dataset/SIH 26067/ctd/raw |
| IGORA | Grid | dataset/SIH 26067/igora |

## 🐛 **Troubleshooting**

### Compilation Errors
1. Check Java version: `java -version` (should be 17+)
2. Clean and rebuild: `./mvnw clean compile`
3. Check imports in modified files

### No Datasets Loading
1. Verify `dataset/SIH 26067` directory exists
2. Check app logs for NetCdfDatasetLoader errors
3. Run `/api/datasets/reload` manually
4. Verify database migration ran: `SELECT * FROM flyway_schema_history`

### Incorrect Profile Counts
1. Check NetCDF file format (must be CF Convention compliant)
2. Verify variable names: latitude, longitude, depth, time
3. Check database for duplicates: `SELECT platform_id, COUNT(*) FROM argo_float GROUP BY platform_id HAVING COUNT(*) > 1`

## 📝 **Next Phase: Advanced Features**

After base integration is complete, consider:

1. **Dataset Comparison UI**
   - Side-by-side profile comparison
   - Statistical comparison tools
   - Anomaly detection

2. **Dynamic Upload**
   - Admin interface for uploading new datasets
   - Real-time validation
   - Automatic ingestion

3. **Export Functionality**
   - Export filtered data as CSV/NetCDF
   - Publication-ready figures
   - Subsetting queries

4. **Advanced Analytics**
   - Machine learning on oceanographic features
   - Automated quality control
   - Trend detection across datasets

## ✅ **Sign-Off Checklist**

- [ ] All backend files compile without errors
- [ ] Frontend builds without warnings
- [ ] Database migration completes successfully
- [ ] All datasets load on app startup
- [ ] API endpoints return expected responses
- [ ] UI displays all datasets correctly
- [ ] Dataset filtering works end-to-end
- [ ] 3D and 2D visualizations update on dataset selection
- [ ] No performance issues with full dataset
- [ ] Documentation updated and complete
