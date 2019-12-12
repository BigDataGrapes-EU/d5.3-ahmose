import React, { useState, useEffect, useRef } from "react";
import vegaEmbed, { vega } from "vega-embed";
import spec from "./spec.vg.json";

const ModelsMatrix = ({
  modelData,
  intervalData,
  featuresInfo,
  modelsInfo
}) => {
  const refAnchor = useRef();
  const [view, setView] = useState(null);

  useEffect(() => {
    vegaEmbed(refAnchor.current, spec, { actions: false })
      .then(result => setView(result.view))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (view) {
      const chModelData = vega
        .changeset()
        .remove(vega.truthy)
        .insert(modelData);
      const chIntervalData = vega
        .changeset()
        .remove(vega.truthy)
        .insert(intervalData);
      const chFeaturesInfo = vega
        .changeset()
        .remove(vega.truthy)
        .insert(featuresInfo);
      const chModelsInfo = vega
        .changeset()
        .remove(vega.truthy)
        .insert(modelsInfo);
      view
        .change("intervalData", chIntervalData)
        .change("featuresInfo", chFeaturesInfo)
        .change("modelsInfo", chModelsInfo)
        .change("modelData", chModelData)
        .resize()
        .run();
    }
  }, [view, modelData, intervalData, featuresInfo]);

  return <div ref={refAnchor} id="vis" />;
};

export default ModelsMatrix;
