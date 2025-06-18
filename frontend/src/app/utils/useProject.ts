import React from "react"
import type { ConfigurationOptions, DisplayResultState } from "../types"

interface ProjectContextType {
  project: DisplayResultState | null;
  setOptions: (project: ConfigurationOptions) => void;
}

export const ProjectContext = React.createContext<ProjectContextType | null>(
  null,
)

export const useProject = () => {
  const context = React.useContext(ProjectContext)
  if (context === null) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}
