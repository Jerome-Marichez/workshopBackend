import OpenAI from 'openai';

const openai =  new OpenAI({ apiKey: "" });


/**
 * Class that wraps the original OpenAI implementation package
 */
export default class ChatGPTWrapper  {
	
	constructor() {
	 	
	}

	/**
	 * @param url The url of the picture to be with the prompt
	 * @param prompt A string that represents the prompt
	 * @returns The first response from chatGPT as a string 
	 */
	async generatePrompt(prompt, url) {
		try {
			const response = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
			{
				role: "user",
				content: [
				{ type: "text", text: prompt },
				{
				type: "image_url",
				image_url: {
				"url": url,
				},
				},
				],
			},
			],
			});
			return response.choices[0]?.message?.content || "";
		} catch (error) {
			console.error('Error generating prompt:', error);
			return "";
		}
	}
}
