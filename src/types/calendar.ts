export type EventResult = {
	id: string;
	recurringId: string | undefined | null;
	summary: string;
	description: string;
	status: string;
	eventType: string;
	accountSource: string;
	attachments: {
		title: string | undefined | null;
		mimeType: string | undefined | null;
		fileUrl: string;
		iconUrl: string | undefined | null;
	}[];
	htmlLink: string | undefined | null;
	organizer: string;
	attendees: {
		email: string | undefined | null;
		name: string | undefined | null;
		response: string | undefined | null;
	}[];
	startTime: string | undefined | null;
	endTime: string | undefined | null;
	location: string | undefined | null;
	conferenceData: {
		solutionName: string | undefined | null;
		entryPoints: {
			entryPointType: string;
			label: string | undefined | null;
			uri: string;
			password: string | undefined | null;
		}[];
	};
};
