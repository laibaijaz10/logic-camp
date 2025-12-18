import { Task, Project } from "../models";
import { StatusItem } from "../types";

// Sample statuses to populate
const defaultStatuses: StatusItem[] = [
  {
    id: 1,
    title: "To Do",
    color: "#6B7280"
  },
  {
    id: 2,
    title: "In Progress", 
    color: "#3B82F6"
  },
  {
    id: 3,
    title: "Review",
    color: "#F59E0B"
  },
  {
    id: 4,
    title: "Done",
    color: "#10B981"
  }
];

export async function populateStatuses() {
  try {
    // Get all tasks and projects that don't have statuses
    const tasks = await Task.findAll({
      where: {
        statuses: null
      }
    });

    const projects = await Project.findAll({
      where: {
        statuses: null
      }
    });

    // Update tasks with default statuses
    await Promise.all(
      tasks.map(task => 
        task.update({ statuses: defaultStatuses })
      )
    );

    // Update projects with default statuses
    await Promise.all(
      projects.map(project => 
        project.update({ statuses: defaultStatuses })
      )
    );

    console.log(`Populated statuses for ${tasks.length} tasks and ${projects.length} projects`);
  } catch (error) {
    console.error("Error populating statuses:", error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  populateStatuses()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
