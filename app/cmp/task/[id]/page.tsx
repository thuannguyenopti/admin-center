"use client";

import { useParams } from "next/navigation";
import { TaskDetailView } from "./TaskDetailView";

export default function TaskDetailPage() {
	const params = useParams();
	const taskId = params.id as string;
	return <TaskDetailView taskId={taskId} />;
}
