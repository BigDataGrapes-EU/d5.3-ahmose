import React, { useState, useEffect, useMemo } from "react";
import { vega } from "vega-embed";
import ModelsMatrix from "./components/ModelsMatrix";
import Controls from "./components/Controls";

//Material Components
import TopAppBar, { TopAppBarFixedAdjust } from "@material/react-top-app-bar";
import Drawer, { DrawerAppContent } from "@material/react-drawer";

//Material CSS Files
import "@material/react-top-app-bar/dist/top-app-bar.min.css";
import "@material/react-drawer/dist/drawer.min.css";

import "./App.css";

const App = () => {
  const [files, setFiles] = useState(null);
  const [modelData, setModelData] = useState([]);
  const [intervalData, setIntervalData] = useState([]);
  const [featuresInfo, setFeaturesInfo] = useState([]);
  const [modelsInfo, setModelsInfo] = useState([]);

  const [selectedModels, setSelectedModels] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);

  // Load data
  useEffect(() => {
    if (!files) {
      setModelData([]);
      setIntervalData([]);
      setFeaturesInfo([]);
      setModelsInfo([]);
    } else {
      var loader = vega.loader();
      Promise.all([
        loader.load(files.models),
        loader.load(files.intervals),
        loader.load(files.features_info),
        loader.load(files.model_info)
      ])
        .then(
          ([
            modelDataFile,
            intervalDataFile,
            featuresInfoFile,
            modelsInfoFile
          ]) => {
            // Generate Model alias and format score
            let info = vega.read(modelsInfoFile, {
              type: "csv",
              parse: "auto"
            });

            const score = Object.keys(info[0]).pop("model");
            const digits = info.length.toString().length;
            const labelFormatter = new Intl.NumberFormat("en-EN", {
              minimumIntegerDigits: digits
            });
            const scoreFormatter = new Intl.NumberFormat("en-EN", {
              maximumFractionDigits: 3,
              minimumFractionDigits: 3
            });
            info = info.sort((a, b) => a[score] - b[score]);
            info = info.map((d, i) => ({
              model: d.model,
              model_label: "M" + labelFormatter.format(i),
              score: `(${score}: ${scoreFormatter.format(d[score])})`
            }));

            // Generate agreement between model and intervals
            const intervalDataRead = vega.read(intervalDataFile, {
              type: "csv",
              parse: "auto"
            });
            const modelDataRead = vega.read(modelDataFile, {
              type: "csv",
              parse: "auto"
            });

            const gen_agree = d => {
              const i = intervalDataRead
                .filter(i => i.feature === d.feature)
                .find(i => {
                  return +i.x1 <= +d.value && +d.value <= +i.x2;
                });

              let label = null;
              let agree = null;
              if (i) {
                label = i.label;
                agree = +(
                  +i.y1 <= +d.expected_value && +d.expected_value <= +i.y2
                );
              }

              return {
                ...d,
                label,
                agree
              };
            };

            setModelData(modelDataRead.map(gen_agree));
            setModelsInfo(info);
            setIntervalData(intervalDataRead);
            setFeaturesInfo(
              vega.read(featuresInfoFile, { type: "csv", parse: "auto" })
            );
          }
        )
        .catch(console.error);
    }
  }, [files]);

  const fModelData = useMemo(() => {
    if (!selectedModels.length || !selectedFeatures.length) return [];
    return modelData.filter(d => {
      return (
        selectedModels.includes(d.model) && selectedFeatures.includes(d.feature)
      );
    });
  }, [selectedModels, selectedFeatures]);

  const updateSelections = (models, features) => {
    const modelsList = Object.keys(models).filter(function(e) {
      return models[e];
    });
    const featureList = Object.keys(features).filter(function(e) {
      return features[e];
    });
    setSelectedModels(modelsList);
    setSelectedFeatures(featureList);
  };

  return (
    <div className="drawer-container">
      <TopAppBar title="AHMOSE: Augmented by Human Model Selection" />
      <TopAppBarFixedAdjust className="top-app-bar-fix-adjust">
        <Drawer className="drawer">
          <Controls
            models={modelsInfo}
            features={featuresInfo}
            updateSelections={updateSelections}
            updateFiles={setFiles}
          />
        </Drawer>
        <DrawerAppContent className="drawer-app-content">
          {fModelData.length ? (
            <ModelsMatrix
              modelData={fModelData}
              intervalData={intervalData}
              featuresInfo={featuresInfo}
              modelsInfo={modelsInfo}
            />
          ) : null}
        </DrawerAppContent>
      </TopAppBarFixedAdjust>
    </div>
  );
};

export default App;
