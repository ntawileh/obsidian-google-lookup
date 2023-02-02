export type PersonURL = {
	type: string | null;
	value: string | null;
};

export type PersonCustomData = {
	key: string | null;
	value: string | null;
};

export type PersonRelation = {
	person: string | null;
	type: string | null;
};

export type PersonAddress = {
	type: string | null;
	poBox: string | null;
	streetAddress: string | null;
	extendedAddress: string | null;
	city: string | null;
	region: string | null;
	postalCode: string | null;
	country: string | null;
	countryCode: string | null;
};

export type PersonNickname = {
	type: string | null;
	value: string | null;
};

export type PersonResult = {
	type?: string;
	displayNameLastFirst?: string;
	firstName?: string;
	lastName?: string;
	middleName?: string;
	birthdays?: (string | null | undefined)[];
	emails?: (string | null | undefined)[];
	phones?: (string | null | undefined)[];
	org?: {
		name?: string | null;
		title?: string | null;
		department?: string | null;
	};
	accountSource: string;
	resourceName: string | undefined | null;
	bio?: string | null;
	contactGroupMembership?: (string | null | undefined)[];
	domainMembership?: boolean | null;
	urls?: (Partial<PersonURL> | null | undefined)[];
	userDefinedData?: (Partial<PersonCustomData> | null | undefined)[];
	clientData?: (Partial<PersonCustomData> | null | undefined)[];
	relations?: (Partial<PersonRelation> | null | undefined)[];
	addresses?: (Partial<PersonAddress> | null | undefined)[];
	nicknames?: (Partial<PersonNickname> | null | undefined)[];
};
