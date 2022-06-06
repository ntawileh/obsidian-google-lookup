export type GoogleCredentials = {
	client_id: string;
	client_secret: string;
	redirect_uris: string;
	redirect_port: number;
};

export type GoogleServiceOptions = {
	credentials: GoogleCredentials;
	tokenFile: string;
};
