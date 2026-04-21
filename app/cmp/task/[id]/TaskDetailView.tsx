"use client";

import { Box } from "@optiaxiom/react";
import TargetContentTypeDialog from "@/app/components/TargetContentTypeDialog";
import { useEffect, useRef } from "react";
import { PreviewPage } from "./components/assets/PreviewPage";
import { SearchPage } from "./components/assets/SearchPage";
import { SuggestedAssetsPanel } from "./components/assets/SuggestedAssetsPanel";
import { BriefEditPage } from "./components/brief/BriefEditPage";
import { BriefPage } from "./components/brief/BriefPage";
import { ContentEmptyPage } from "./components/content/ContentEmptyPage";
import { ContentFilledPage } from "./components/content/ContentFilledPage";
import { PublishConfirmDialog } from "./components/publishing/PublishConfirmDialog";
import { PublishingPage } from "./components/publishing/PublishingPage";
import { TaskCanvas } from "./components/shared/TaskCanvas";
import { WorkflowChangeModal } from "./components/workflow/WorkflowChangeModal";
import { WorkflowSidebar } from "./components/workflow/WorkflowSidebar";
import { useTaskDetailState } from "./useTaskDetailState";

export function TaskDetailView({ taskId }: { taskId: string }) {
	const state = useTaskDetailState(taskId);

	const prevAllDone = useRef(state.isAllWorkflowDone);
	useEffect(() => {
		if (state.isAllWorkflowDone && !prevAllDone.current && !state.isTaskPublished) {
			state.setPublishConfirmOpen(true);
		}
		prevAllDone.current = state.isAllWorkflowDone;
	}, [state.isAllWorkflowDone, state.isTaskPublished, state.setPublishConfirmOpen]);

	const workflowSidebar = (
		<WorkflowSidebar
			filteredTemplates={state.filteredWorkflowTemplates}
			isAllDone={state.isAllWorkflowDone}
			isMenuOpen={state.workflowMenuOpen}
			onMarkComplete={state.markTaskComplete}
			onRequestWorkflowChange={state.handleWorkflowSelect}
			onSetStepAssignee={state.setStepAssigneeForTask}
			onToggleChecklistItem={state.toggleChecklistItemForTask}
			onToggleStepDone={state.toggleStepDoneForTask}
			onToggleStepExpanded={state.toggleStepExpandedForTask}
			onToggleWorkflowMenu={state.toggleWorkflowMenu}
			onUndoComplete={state.undoTaskComplete}
			onWorkflowSearchChange={state.setWorkflowSearch}
			progressPercent={state.workflowProgressPercent}
			searchValue={state.workflowSearch}
			statusIntent={state.workflowStatusIntent}
			statusLabel={state.workflowStatusLabel}
			workflowState={state.taskWorkflowState}
			workflowTemplateName={state.activeWorkflowTemplate.name}
		/>
	);

	return (
		<Box style={{ minHeight: "calc(100vh - 48px)" }}>
			{state.scene === "brief" && (
				<TaskCanvas
					left={
						<BriefPage
							activeTab={state.activeTab}
							briefContent={state.briefContent}
							onOpenEdit={state.openBriefEdit}
							onTabChange={state.handleTabChange}
							taskTitle={state.taskTitle}
						/>
					}
					right={workflowSidebar}
				/>
			)}

			{state.scene === "brief-edit" && (
				<TaskCanvas
					left={
						<BriefEditPage
							activeTab={state.activeTab}
							briefContent={state.draftBriefContent}
							onBriefContentChange={state.setDraftBriefContent}
							onCancel={state.cancelBriefEdit}
							onSave={state.saveBriefEdit}
							onTabChange={state.handleTabChange}
							taskTitle={state.taskTitle}
						/>
					}
					right={
						<SuggestedAssetsPanel
							assets={state.panelAssetsWithSelection}
							onAddToTask={state.addSelectedPanelAssetsToTask}
							onClearSelection={state.clearPanelAssetSelection}
							onClose={() => state.handleTabChange("brief")}
							onEditSearch={() => state.openSearch("brief-edit")}
							onToggleSelect={state.togglePanelAssetSelection}
						/>
					}
				/>
			)}

			{state.scene === "search" && (
				<SearchPage
					assets={state.rankedSearchAssets}
					exclude={state.exclude}
					onAdd={state.addSelectedSearchAssetsToTask}
					onAssetClick={state.openSelectedAssetPreview}
					onBack={state.returnFromSearch}
					onExcludeChange={state.setExclude}
					onPerspectiveChange={state.updatePerspective}
					onToggleSelect={state.toggleSearchAssetSelection}
					perspectives={state.perspectives}
				/>
			)}

			{state.scene === "preview" && (
				<PreviewPage asset={state.selectedAsset} onAdd={state.addSelectedSingleAssetToTask} onClose={state.closePreview} />
			)}

			{state.scene === "content-empty" && (
				<TaskCanvas
					left={
						<ContentEmptyPage
							activeTab={state.activeTab}
							onAddArticle={state.addArticle}
							onAddContent={() => state.openSearch("content-empty")}
							onAddContentFromModel={state.addContentInstanceFromModel}
							onTabChange={state.handleTabChange}
							taskTitle={state.taskTitle}
						/>
					}
					right={workflowSidebar}
				/>
			)}

			{(state.scene === "content" || state.scene === "content-panel") && (
				<TaskCanvas
					left={
						<ContentFilledPage
							activeTab={state.activeTab}
							applications={state.applications}
							contentInstances={state.contentInstances}
							currentTaskId={state.taskId}
							taskTitle={state.taskTitle}
							onAddArticle={state.addArticle}
							onAddContent={() => state.openSearch(state.scene)}
							onAddContentFromModel={state.addContentInstanceFromModel}
							onAddToApplication={state.handleAddToApplication}
							onOpenSuggested={() => state.setSuggestedPanelOpen(true)}
							onSelectArticle={state.setSelectedArticleId}
							onSelectContentInstance={state.setSelectedContentInstanceId}
							onSelectPage={state.setSelectedPageId}
							onSelectTaskAsset={state.setSelectedTaskAssetId}
							onTabChange={state.handleTabChange}
							pages={state.pages}
							previewCurrentEle={state.previewCurrentEle}
							previewHoverEle={state.previewHoverEle}
							previewOutlines={state.previewOutlines}
							selectedArticleId={state.selectedArticleId}
							selectedContentInstanceId={state.selectedContentInstanceId}
							selectedPageId={state.selectedPageId}
							selectedTaskAssetId={state.selectedTaskAssetId}
							setContentInstances={state.setContentInstances}
							setPages={state.setPages}
							setPreviewCurrentEle={state.setPreviewCurrentEle}
							setPreviewHoverEle={state.setPreviewHoverEle}
							setPreviewOutlines={state.setPreviewOutlines}
							setTaskArticles={state.setTaskArticles}
							setTaskAssets={state.setTaskAssets}
							taskArticles={state.taskArticles}
							taskAssets={state.taskAssets}
						/>
					}
					right={
						state.suggestedPanelOpen ? (
							<SuggestedAssetsPanel
								assets={state.panelAssetsWithSelection}
								onAddToTask={state.addSelectedPanelAssetsToTask}
								onClearSelection={state.clearPanelAssetSelection}
								onClose={() => state.setSuggestedPanelOpen(false)}
								onEditSearch={() => state.openSearch(state.scene)}
								onToggleSelect={state.togglePanelAssetSelection}
							/>
						) : (
							workflowSidebar
						)
					}
				/>
			)}

			{state.scene === "publishing" && (
				<TaskCanvas
					left={
						<PublishingPage
							activeTab={state.activeTab}
							channels={state.publishingChannels}
							contentInstances={state.taskContentInstances}
							isPublished={state.isTaskPublished}
							onAddChannel={state.addPublishingChannel}
							onEditChannel={state.updateChannelContent}
							onRemoveChannel={state.removePublishingChannel}
							onTabChange={state.handleTabChange}
							pages={state.taskPages}
							taskTitle={state.taskTitle}
						/>
					}
					right={workflowSidebar}
				/>
			)}

			{state.workflowDialogOpen && (
				<WorkflowChangeModal
					onCancel={state.closeWorkflowDialog}
					onConfirm={state.applyWorkflowChange}
					workflowName={state.pendingWorkflowName}
				/>
			)}

			{state.instanceToAdd && (
				<TargetContentTypeDialog
					availableTargets={state.targetDialogAvailableTargets}
					onClose={state.closeTargetSelection}
					onSelect={(targetContentTypeId) => state.createAndAddPage(state.instanceToAdd!, targetContentTypeId)}
					open={state.isTargetSelectionOpen}
				/>
			)}

			<PublishConfirmDialog
				applications={state.applications}
				channels={state.publishingChannels}
				contentInstances={state.taskContentInstances}
				onCancel={state.cancelPublishConfirm}
				onConfirm={state.confirmPublish}
				open={state.publishConfirmOpen}
				pages={state.taskPages}
			/>
		</Box>
	);
}
