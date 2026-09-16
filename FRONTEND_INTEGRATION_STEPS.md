# Frontend Dataset Integration - Step-by-Step Guide

## Overview
This guide provides exact code snippets for integrating the DatasetSelector into the DEEPSYNC dashboard.

## Step 1: DatasetSelector Component (✅ COMPLETE)

File: `frontend/src/components/dashboard3d/DatasetSelector.jsx`
- Shows available datasets with counts
- Allows selecting/deselecting datasets
- Updates app state on change

## Step 2: Update App Store (✅ COMPLETE)

File: `frontend/src/store/useAppStore.js`

Added state:
```javascript
// Dataset selection
selectedDatasets: ['argo', 'bgc', 'glider', 'ctd'],
setSelectedDatasets: (datasets) => set({ selectedDatasets: datasets }),
```

## Step 3: Update OceanScene Component (✅ COMPLETE)

File: `frontend/src/components/dashboard3d/OceanScene.jsx`

Changes made:
1. Added import:
```javascript
import DatasetSelector from './DatasetSelector'
```

2. Added to store destructuring:
```javascript
const { ..., selectedDatasets, setSelectedDatasets } = useAppStore()
```

3. Updated data fetching:
```javascript
selectedDatasets.forEach(ds => params.append('dataset', ds))
```

4. Updated useEffect dependency:
```javascript
}, [filter, selectedDatasets])
```

## Step 4: Integrate DatasetSelector into Dashboard (IN PROGRESS)

File: `frontend/src/views/Dashboard.jsx`

### Step 4a: Add Import ✅
```javascript
import DatasetSelector from '../components/dashboard3d/DatasetSelector'
```

### Step 4b: Extract from Store ✅
```javascript
const {
  // ... existing destructuring ...
  selectedDatasets,
  setSelectedDatasets,
} = useAppStore()
```

### Step 4c: Add DatasetSelector to JSX (TODO)

Location: Add to the left control panel of the Dashboard, near the top.

Find the section with instrument type selector and add:

```jsx
{/* Dataset Selector */}
<div className="mt-4 border-t border-sky-100 pt-4">
  <DatasetSelector 
    selectedDatasets={selectedDatasets}
    onDatasetChange={setSelectedDatasets}
  />
</div>
```

**Exact Location in Dashboard.jsx:**
- Search for: `<label className="text-xs text-slate-600">Instrument Type</label>`
- This is around line 36-46 in the FloatSelector component
- Add the DatasetSelector BEFORE the FloatSelector or after instrument type selection

## Step 5: Update FloatSelector to Show Dataset Source (TODO)

File: `frontend/src/components/dashboard2d/FloatSelector.jsx`

Enhancement: Add dataset filter to float selection

```jsx
// Add dataset filter next to instrument type
<div>
  <label className="text-xs text-slate-600">Dataset</label>
  <select
    multiple
    value={selectedDatasets}
    onChange={(e) => setSelectedDatasets(Array.from(e.target.selectedOptions, option => option.value))}
    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white"
  >
    <option value="argo">Argo Floats</option>
    <option value="bgc">BGC Floats</option>
    <option value="glider">Gliders</option>
    <option value="ctd">CTD Casts</option>
  </select>
</div>
```

## Step 6: Update 2D Charts to Filter by Dataset (TODO)

Update each chart component to respect `selectedDatasets`:

### ProfileChart.jsx
```javascript
// Add to component
const { selectedDatasets } = useAppStore()

// Filter data before rendering
useEffect(() => {
  if (selectedFloat && selectedDatasets) {
    const filtered = selectedFloat.profileSamples.filter(s =>
      !selectedFloat.dataSource || selectedDatasets.includes(selectedFloat.dataSource)
    )
    // Update chart with filtered data
  }
}, [selectedFloat, selectedDatasets])
```

### TimeSeriesChart.jsx
```javascript
// Filter time series data by dataset
const filteredPoints = points.filter(p =>
  !p.dataSource || selectedDatasets.includes(p.dataSource)
)
```

## Step 7: Build and Test

### Build Frontend
```bash
cd frontend
npm run build
```

### Run Dev Server
```bash
npm run dev
```

### Manual Testing Checklist
1. Open http://localhost:5173/dashboard
2. Look for DatasetSelector panel in left controls
3. Check that datasets are listed with counts
4. Toggle datasets on/off
5. Verify 3D visualization updates
6. Check that 2D charts update accordingly
7. Monitor browser console for errors

## Step 8: Integration Points Summary

### Components Using selectedDatasets
1. **OceanScene** - Filters 3D visualization
2. **FloatSelector** - Filters instrument list
3. **ProfileChart** - Filters profile data
4. **TimeSeriesChart** - Filters time series
5. **Dashboard** - Manages overall state

### Data Flow
```
User toggles datasets in DatasetSelector
↓
setSelectedDatasets() called
↓
selectedDatasets state updated in store
↓
OceanScene and charts re-render
↓
New API call with dataset parameter
↓
Backend filters and returns data
↓
Visualizations update
```

## Step 9: API Integration

### Frontend Calls (Already Updated)
```javascript
// OceanScene fetches ocean-data with dataset filter
apiClient.get(`/ocean-data?${params.toString()}`)
// params includes: dataset=argo&dataset=bgc&dataset=glider

// Floats endpoint should also support filtering
apiClient.get(`/floats?dataset=argo,bgc`)
```

### Backend Endpoints (Already Implemented)
```
GET /api/datasets                    - List all datasets
GET /api/datasets/stats              - Get counts per dataset
GET /api/datasets/{type}             - Get profiles for dataset
POST /api/datasets/reload            - Reload datasets
GET /api/ocean-data?dataset=argo     - Filter grid points
GET /api/floats?dataset=argo         - Filter floats (TODO: implement)
```

## Step 10: Styling & Polish

### DatasetSelector Styling
Already included in DatasetSelector.jsx with:
- Rounded corners, borders, shadows
- Hover effects
- Color-coded badges
- Responsive layout

### Integration with Dashboard Theme
- Uses existing color scheme (sky-100, sky-600, etc.)
- Follows existing padding/spacing patterns
- Consistent with other control panels

## Common Issues & Solutions

### Issue: Datasets not showing in selector
**Solution**: Check that `/api/datasets` endpoint is working
```bash
curl http://localhost:8080/api/datasets
```

### Issue: 3D scene doesn't update when selecting datasets
**Solution**: Check browser console for errors, verify OceanScene is using selectedDatasets

### Issue: Counts are wrong
**Solution**: Run `/api/datasets/reload` to refresh, check database counts

### Issue: Performance issues with large datasets
**Solution**: 
- Implement pagination for FloatSelector
- Use Level of Detail (LOD) for 3D rendering
- Cache dataset stats on frontend

## File Modifications Summary

| File | Changes | Status |
|------|---------|--------|
| DatasetSelector.jsx | Created | ✅ |
| useAppStore.js | Added state | ✅ |
| OceanScene.jsx | Updated data fetching | ✅ |
| Dashboard.jsx | Imports, state extraction | ✅ |
| Dashboard.jsx JSX | Add DatasetSelector (see Step 4c) | 🟡 TODO |
| FloatSelector.jsx | Add dataset filter | 🟡 TODO |
| Chart components | Filter by dataset | 🟡 TODO |

## Testing Checklist

- [ ] DatasetSelector renders in Dashboard
- [ ] All datasets show with counts > 0
- [ ] Clicking checkbox toggles dataset
- [ ] "Select All" button selects all datasets
- [ ] "Clear" button deselects all datasets
- [ ] 3D mesh updates when datasets change
- [ ] No console errors
- [ ] API calls include correct dataset parameters
- [ ] Backend returns filtered data
- [ ] No performance degradation
- [ ] Responsive layout on mobile

## Next Steps

1. Implement Step 4c (add DatasetSelector to Dashboard JSX)
2. Run frontend build
3. Test in browser
4. Implement Steps 5-6 (FloatSelector and charts)
5. Performance optimization if needed

