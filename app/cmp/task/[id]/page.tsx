"use client";

import { useParams } from "next/navigation";
import { CmpOpalAssetRecommendation } from "./CmpOpalAssetRecommendation";

export default function TaskDetailPage() {
	const params = useParams();
	const taskId = params.id as string;
	return <CmpOpalAssetRecommendation taskId={taskId} />;
}
