"use client";

import React from "react";

interface AuthorData {
	name: string;
	bio?: string;
	image?: any;
	email?: string;
	website?: string;
}

interface BlogPostAuthorProps {
	author: string | AuthorData | Record<string, any>;
}

export const BlogPostAuthor = React.memo(function BlogPostAuthor({
	author,
}: BlogPostAuthorProps) {
	// Extract author data from object or use mock data for string IDs
	const authorData = getAuthorData(author);

	if (!authorData) {
		return null;
	}

	const imageUrl = typeof authorData.image === "string"
		? authorData.image
		: authorData.image?.url || authorData.image?.src;

	return (
		<div className="border-t border-gray-200 pt-6 mt-8">
			<div className="flex items-start gap-4">
				{/* Author avatar */}
				{imageUrl && (
					<img
						src={imageUrl}
						alt={authorData.name}
						className="w-16 h-16 rounded-full object-cover flex-shrink-0"
					/>
				)}

				{/* Author info */}
				<div className="flex-1">
					<h3 className="text-lg font-semibold text-gray-900 mb-1">
						{authorData.name}
					</h3>
					{authorData.bio && (
						<p className="text-gray-600 text-sm leading-relaxed mb-2">
							{authorData.bio}
						</p>
					)}
					{/* Links */}
					{(authorData.email || authorData.website) && (
						<div className="flex gap-4 text-sm">
							{authorData.email && (
								<a
									href={`mailto:${authorData.email}`}
									className="text-blue-600 hover:underline"
								>
									Email
								</a>
							)}
							{authorData.website && (
								<a
									href={authorData.website}
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-600 hover:underline"
								>
									Website
								</a>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
});

// Helper function to extract author data
function getAuthorData(author: any): AuthorData | null {
	// Case 1: Already a full object with name property
	if (typeof author === "object" && author !== null && author.name) {
		return author as AuthorData;
	}

	// Case 2: String ID - return null (requires proper ContentReference data)
	// In production, this should be handled by ContentReferenceRenderer
	return null;
}
