import React, { useState, useEffect, useReducer } from "react";
import Checkbox from "@material/react-checkbox";
import Select from "@material/react-select";
import List, {
  ListItem,
  ListGroup,
  ListGroupSubheader,
  ListDivider,
  ListItemText
} from "@material/react-list";

import "@material/react-checkbox/dist/checkbox.min.css";
import "@material/react-select/dist/select.min.css";
import "@material/react-list/dist/list.min.css";
import "./Controls.css";

var files_in_data = require
  .context("../../../public/data", true, /\.csv/)
  .keys();

var data_files_tree = files_in_data.reduce(function(dict, path) {
  var x = dict;
  path = path.substring(1);
  path
    .split("/")
    .splice(1)
    .forEach(function(item) {
      if (!x[item]) {
        x[item] = {};
      }
      x = x[item];
    });
  x.path = path;
  return dict;
}, {});

const Controls = ({ models, features, updateSelections, updateFiles }) => {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedIntervals, setSelectedIntervals] = useState("");
  const [intervalDropdown, setIntervalDropdown] = useState(false);

  const [modelsChecked, setModelsChecked] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {}
  );
  const [featuresChecked, setFeaturesChecked] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {}
  );

  // Check 2 by default
  useEffect(() => {
    const num = 2;
    const names = models.map(d => d.model);
    setModelsChecked(
      names.reduce((res, val) => {
        res[val] = Object.keys(res).length < num;
        return res;
      }, {})
    );
  }, [models]);

  // Check all by default
  useEffect(() => {
    const names = features.map(d => d.feature);
    setFeaturesChecked(
      names.reduce((res, val) => {
        res[val] = true;
        return res;
      }, {})
    );
  }, [features]);

  //Update selected models
  useEffect(() => {
    updateSelections(modelsChecked, featuresChecked);
  }, [modelsChecked, featuresChecked]);

  useEffect(() => {
    setSelectedIntervals("");
    if (selectedProject === "") {
      setIntervalDropdown(false);
    } else setIntervalDropdown(true);
  }, [selectedProject]);

  useEffect(() => {
    if (intervalDropdown) {
      let intervals = "";
      const main = data_files_tree[selectedProject];
      if (selectedIntervals && selectedIntervals !== "**No Intervals**")
        intervals =
          "data" + main["intervals"][selectedIntervals + ".csv"]["path"];
      updateFiles({
        intervals: intervals,
        models: "data" + main["models_data.csv"]["path"],
        features_info: "data" + main["features_info.csv"]["path"],
        model_info: "data" + main["models_info.csv"]["path"]
      });
    } else {
      updateFiles(null);
    }
  }, [selectedIntervals]);

  const projectsList = [""].concat(Object.keys(data_files_tree));
  let intervalsList = selectedProject
    ? Object.keys(data_files_tree[selectedProject]["intervals"])
    : [];

  intervalsList = intervalsList.map(d => d.substring(0, d.indexOf(".csv")));
  return (
    <div>
      <Select
        label="Select Project"
        onChange={e => setSelectedProject(e.target.value)}
        value={selectedProject}
        options={projectsList}
      />
      <Select
        disabled={!intervalDropdown}
        label="Select Intervals"
        onChange={e => setSelectedIntervals(e.target.value)}
        value={selectedIntervals}
        options={["", "**No Intervals**"].concat(intervalsList)}
      />
      <ListGroup>
        <ListGroupSubheader>Models</ListGroupSubheader>
        <List twoLine dense>
          {models.map(m => (
            <ListItem
              key={m.model}
              onClick={e => {
                e.preventDefault();
                setModelsChecked({ [m.model]: !modelsChecked[m.model] });
              }}
            >
              <ListItemText
                className="checkbox"
                primaryText={m.model_label + " " + m.score}
                secondaryText={m.model}
              />
              <Checkbox
                nativeControlId={m.model}
                checked={modelsChecked[m.model]}
                onChange={() =>
                  setModelsChecked({ [m.model]: !modelsChecked[m.model] })
                }
              />
            </ListItem>
          ))}
          <ListDivider />
        </List>
        <ListGroupSubheader>Features</ListGroupSubheader>
        <List twoLine dense>
          {features.map(m => (
            <ListItem
              key={m.feature}
              onClick={e => {
                e.preventDefault();
                setFeaturesChecked({
                  [m.feature]: !featuresChecked[m.feature]
                });
              }}
            >
              <ListItemText
                className="checkbox"
                primaryText={m.feature_label}
                secondaryText={m.feature}
              />
              <Checkbox
                nativeControlId={m.feature}
                checked={featuresChecked[m.feature]}
                onChange={() =>
                  setFeaturesChecked({
                    [m.feature]: !featuresChecked[m.feature]
                  })
                }
              />
            </ListItem>
          ))}
          <ListDivider />
        </List>
      </ListGroup>
    </div>
  );
};

export default Controls;
