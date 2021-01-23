// @ts-check
import SVGO from "svgo";

const svgo = new SVGO({
  plugins: [
    { cleanupAttrs: true },
    { removeDoctype: true },
    { removeXMLProcInst: true },
    { removeComments: true },
    { removeMetadata: true },
    { removeTitle: true },
    { removeDesc: true },
    { removeUselessDefs: true },
    { removeEditorsNSData: true },
    { removeEmptyAttrs: true },
    { removeHiddenElems: true },
    { removeEmptyText: true },
    { removeEmptyContainers: true },
    { removeViewBox: false },
    { convertColors: { currentColor: true } },
    { convertTransform: true },
    { removeUselessStrokeAndFill: true },
    { cleanupIDs: true },
    { mergePaths: true },
    { convertShapeToPath: true },
  ],
});

export default svgo;
