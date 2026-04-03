"use client";

import { Box } from "@optiaxiom/react";
import TargetContentTypeDialog from "@/app/components/TargetContentTypeDialog";
import { PreviewPage } from "./components/assets/PreviewPage";
import { SearchPage } from "./components/assets/SearchPage";
import { SuggestedAssetsPanel } from "./components/assets/SuggestedAssetsPanel";
import { BriefEditPage } from "./components/brief/BriefEditPage";
import { BriefPage } from "./components/brief/BriefPage";
import { ContentEmptyPage } from "./components/content/ContentEmptyPage";
import { ContentFilledPage } from "./components/content/ContentFilledPage";
import { TaskCanvas } from "./components/shared/TaskCanvas";
import { WorkflowChangeModal } from "./components/workflow/WorkflowChangeModal";
import { WorkflowSidebar } from "./components/workflow/WorkflowSidebar";
import { useCmpOpalAssetRecommendationState } from "./useCmpOpalAssetRecommendationState";

export function CmpOpalAssetRecommendation() {
	const state = useCmpOpalAssetRecommendationState();

	const workflowSidebar = (
		<WorkflowSidebar
			filteredTemplates={state.filteredWorkflowTemplates}
			isMenuOpen={state.workflowMenuOpen}
			onRequestWorkflowChange={state.handleWorkflowSelect}
			onToggleWorkflowMenu={state.toggleWorkflowMenu}
			onWorkflowSearchChange={state.setWorkflowSearch}
			searchValue={state.workflowSearch}
			workflow={state.activeWorkflow}
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
		</Box>
	);
}
