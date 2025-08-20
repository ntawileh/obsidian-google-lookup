export type EventResult = {
	summary: string;
	description: string;
	accountSource: string;
	htmlLink: string | undefined | null;
	organizer: string;
	attendees: {
		email: string | undefined | null;
		name: string | undefined | null;
		response: string | undefined | null;
	}[];
	startTime: string | undefined | null;
	endTime: string | undefined | null;
};
