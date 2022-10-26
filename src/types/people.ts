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
	urls?: (Partial<PersonURL> | null | undefined)[];
	userDefinedData?: (Partial<PersonCustomData> | null | undefined)[];
	clientData?: (Partial<PersonCustomData> | null | undefined)[];
	relations?: (Partial<PersonRelation> | null | undefined)[];
	bio?: string | null;
};
