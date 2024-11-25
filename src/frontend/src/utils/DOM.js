/**
 * Get dataset from element, if not fount then search up to DOM tree
 * @param element: DOM Element
 * @param datasetKey: string - key name
 */

export function getDataset(element, datasetKey) {
    while (element) {
        if (element.dataset && element.dataset[datasetKey]) {
            return element.dataset[datasetKey];
        }
        element = element.parentElement;
    }
    return null;
}
