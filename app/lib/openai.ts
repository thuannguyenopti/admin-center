<<<<<<< HEAD
/**
 * Shared OpenAI client and utilities for AI features
 */

import OpenAI from "openai";

/**
 * Shared OpenAI client instance
 * Returns null if API key is not configured
 */
export const openai = process.env.OPENAI_API_KEY
	? new OpenAI({apiKey: process.env.OPENAI_API_KEY})
	: null;

/**
 * Check if OpenAI is configured and throw error if not
 */
export function requireOpenAI(): OpenAI {
	if (!openai) {
		throw new Error("OpenAI API key not configured");
	}
	return openai;
}
=======
/**
 * Shared OpenAI client and utilities for AI features
 */

import OpenAI from "openai";

/**
 * Shared OpenAI client instance
 * Returns null if API key is not configured
 */
export const openai = process.env.OPENAI_API_KEY
	? new OpenAI({apiKey: process.env.OPENAI_API_KEY})
	: null;

/**
 * Check if OpenAI is configured and throw error if not
 */
export function requireOpenAI(): OpenAI {
	if (!openai) {
		throw new Error("OpenAI API key not configured");
	}
	return openai;
}
>>>>>>> origin/main
