import { useState } from "react";
import Welcome from "./Welcome";
import MainMenu from "./MainMenu";
import FeatureFlow from "./FeatureFlow";

type View = "welcome" | "menu" | "feature";

const Index = () => {
  const [currentView, setCurrentView] = useState<View>("welcome");
  const [selectedFeature, setSelectedFeature] = useState<string>("");

  const handleStart = () => {
    setCurrentView("menu");
  };

  const handleSelectFeature = (feature: string) => {
    setSelectedFeature(feature);
    setCurrentView("feature");
  };

  const handleBack = () => {
    setCurrentView("menu");
    setSelectedFeature("");
  };

  return (
    <>
      {currentView === "welcome" && <Welcome onStart={handleStart} />}
      {currentView === "menu" && <MainMenu onSelectFeature={handleSelectFeature} />}
      {currentView === "feature" && (
        <FeatureFlow feature={selectedFeature} onBack={handleBack} />
      )}
    </>
  );
};

export default Index;
