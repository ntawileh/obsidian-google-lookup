export type PersonInsertionMode = 'inline' | 'link';

export type GoogleLookupPluginSettings = {
	client_id: string;
	client_secret: string;
	client_redirect_uri_port: string;
	template_file_person: string;
	folder_person: string;
	person_filename_format: string;
	template_file_event: string;
	event_date_format: string;
	rename_person_file: boolean;
	person_insertion_mode: string; // 'inline' | 'link'
};
