# v21 — Offline Breaking Changes

This release removes the deprecated `idbInfo` field and the legacy `provideOffline(options)` signature
that were retained as compatibility adapters since v21.

## 1. Provider registration

**Before (v21 compatibility adapter — removed):**

```ts
provideOffline({ enable: true });
provideOffline({ enable: false });
```

**After:**

```ts
// Enable offline:
provideOffline(withIndexedDb());

// Disable offline (simply omit the call):
// no provider needed — omitting provideOffline registers nothing
```

## 2. Layer options — `idbInfo` removed

The `idbInfo` field on `VectorLayerOptions` and the `IdbInfo` interface have been removed.
Use the `offline` field instead.

**Before:**

```ts
{
  idbInfo: { storeToIdb: true, contextUri: 'my-context' }
} satisfies VectorLayerOptions
```

**After:**

```ts
{
  offline: { enabled: true, contextUri: 'my-context' }
} satisfies VectorLayerOptions
```

### Fields mapped to `offline`

| Legacy `idbInfo` field | Replacement                         |
| ---------------------- | ----------------------------------- |
| `storeToIdb`           | `offline.enabled`                   |
| `contextUri`           | `offline.contextUri`                |
| `_firstLoad`           | Internal — no public replacement    |
| `_deleteFromIdb`       | Removed — see deletion intent below |

## 3. Vector preload bypass options

The legacy boolean preload options `bypassVisible` and `bypassResolution` have been
replaced by the `bypass` mode on `VectorLayerPreloadOptions`.

**Before:**

```ts
{
  preload: { bypassVisible: true, bypassResolution: true }
} satisfies VectorLayerOptions
```

**After:**

```ts
{
  preload: { bypass: 'all' }
} satisfies VectorLayerOptions
```

Use `bypass: 'visibility'` or `bypass: 'resolution'` when only one layer constraint
should be bypassed during preload.

## 4. Persisted-layer deletion intent

The `_deleteFromIdb` flag was an internal mechanism for signalling that a layer's persisted
data should be removed when the layer was detached from the map.
This flag is removed with no direct replacement in this release.

Layer data persisted in IndexedDB is now only removed by calling the dedicated removal API
on the offline layer persistence service, not by setting a flag on layer options.

## 5. Restored-layer API

In the `LayerService`, `createAsyncIdbLayers` is replaced by `createAsyncOfflineLayers`. Prefer the
opt-in `OfflineLayerRestoreService`, registered automatically by `withIndexedDb()`.
Applications that injected `LayerService` solely to restore persisted layers should
inject `OFFLINE_LAYER_RESTORE` instead.

## 6. Removed public exports

| Symbol            | Package             | Replacement                          |
| ----------------- | ------------------- | ------------------------------------ |
| `IdbInfo`         | `@igo2/geo`         | `VectorLayerOfflineOptions`          |
| `IOfflineOptions` | `@igo2/geo/offline` | `OfflineFeature` / `withIndexedDb()` |
