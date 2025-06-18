interface LivestockSummary {
	pid: string;
	organisationPid: string;
	id: number;
	total: number;
	males: number;
	females: number;
	unkownGender: number;
	active: number;
	transferred: number;
	sold: number;
	deceased: number;
	species: number;
	breeds: number;
	totalPurchasedValue: number;
	createdAt: Date;
	updatedAt: Date;
}

export type { LivestockSummary };
