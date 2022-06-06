import { calendar_v3, calendar } from '@googleapis/calendar';
import { getAuthClient } from './auth';
import { EventResult } from '@/types';

interface ServiceOptions {
	credentialsFile: string;
	tokenFile: string;
}

interface QueryOptions {
	service: calendar_v3.Calendar;
	accountName: string;
}

export const getCalendarService = async ({ credentialsFile, tokenFile }: ServiceOptions) => {
	const auth = await getAuthClient(credentialsFile, tokenFile);

	if (!auth) {
		throw 'unable to get auth client';
	}

	return calendar({
		version: 'v3',
		auth: auth
	});
};

export const searchCalendarEvents = async (
	query: moment.Moment,
	{ service, accountName }: QueryOptions
): Promise<EventResult[] | undefined> => {
	try {
		const response = await service.events.list({
			calendarId: 'primary',
			maxAttendees: 10,
			singleEvents: true,
			maxResults: 12,
			orderBy: 'startTime',
			timeMin: query.startOf('day').format(),
			timeMax: query.endOf('day').format()
		});

		if (response.status !== 200) {
			console.warn(`error querying people api ${response.statusText}`);
			return;
		}
		console.log(JSON.stringify(response.data, null, 2));

		if (!response.data?.items || response.data?.items?.length === 0) {
			return [];
		}

		return response.data.items.map((item): EventResult => {
			const { summary, description, htmlLink, organizer, start, end, attendees } = item;
			return {
				summary: summary || '',
				description: description || '',
				accountSource: accountName,
				htmlLink,
				organizer: organizer?.email || '',
				startTime: start?.dateTime,
				endTime: end?.dateTime,
				attendees:
					attendees?.map((a) => {
						return { response: a.responseStatus, email: a.email };
					}) || []
			};
		});
	} catch (err: any) {
		console.warn(`Cannot query calendar service ${err.message}`);
	}
};
