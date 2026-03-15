export type DocumentFieldType =
    | "text"
    | "textarea"
    | "date"
    | "number"
    | "email"
    | "tel"
    | "url"
    | "select"
    | "checkbox";

export interface DocumentFieldOption {
    label: string;
    value: string;
}

export interface DocumentField {
    id: string;
    label: string;
    type: DocumentFieldType;
    placeholder?: string;
    required?: boolean;
    helpText?: string;
    section?: string;
    options?: DocumentFieldOption[];
    defaultValue?: string | number | boolean;
}

export interface DocumentDefinition {
    key: string;
    label: string;
    description?: string;
    category: string;
    fields: DocumentField[];
}

const commonMetaFields: DocumentField[] = [
    {
        id: "effectiveDate",
        label: "Effective Date",
        type: "date",
        required: true,
        section: "General",
    },
    {
        id: "governingLaw",
        label: "Governing Law / Jurisdiction",
        type: "text",
        placeholder: "e.g. Delaware, Nigeria, England & Wales",
        required: false,
        section: "General",
    },
];

export const DOCUMENT_DEFINITIONS: Record<string, DocumentDefinition> = {
    // =========================
    // BUSINESS / CORPORATE
    // =========================
    "NDA (Mutual)": {
        key: "NDA (Mutual)",
        label: "NDA (Mutual)",
        description:
            "Mutual confidentiality agreement where both parties may disclose confidential information.",
        category: "Business / Corporate",
        fields: [
            {
                id: "partyA",
                label: "Party A Name",
                type: "text",
                placeholder: "e.g. Acme Technologies Ltd.",
                required: true,
                section: "Parties",
            },
            {
                id: "partyAAddress",
                label: "Party A Address",
                type: "textarea",
                placeholder: "Full legal/business address",
                required: false,
                section: "Parties",
            },
            {
                id: "partyB",
                label: "Party B Name",
                type: "text",
                placeholder: "e.g. Globex Holdings Inc.",
                required: true,
                section: "Parties",
            },
            {
                id: "partyBAddress",
                label: "Party B Address",
                type: "textarea",
                placeholder: "Full legal/business address",
                required: false,
                section: "Parties",
            },
            {
                id: "purpose",
                label: "Purpose of NDA",
                type: "textarea",
                placeholder: "e.g. Evaluation of a strategic partnership or acquisition",
                required: true,
                section: "Purpose",
            },
            {
                id: "confidentialInfoDefinition",
                label: "Definition of Confidential Information",
                type: "textarea",
                placeholder:
                    "Describe what should be treated as confidential under this agreement",
                required: false,
                section: "Confidentiality Scope",
            },
            {
                id: "exclusions",
                label: "Confidentiality Exclusions",
                type: "textarea",
                placeholder:
                    "e.g. Public information, independently developed information, lawfully received information",
                required: false,
                section: "Confidentiality Scope",
            },
            {
                id: "termLength",
                label: "Term of Agreement",
                type: "text",
                placeholder: "e.g. 2 years",
                required: true,
                section: "Term",
            },
            {
                id: "survivalPeriod",
                label: "Confidentiality Survival Period",
                type: "text",
                placeholder: "e.g. 3 years after termination",
                required: false,
                section: "Term",
            },
            ...commonMetaFields,
        ],
    },

    "NDA (One-way)": {
        key: "NDA (One-way)",
        label: "NDA (One-way)",
        description:
            "One-way confidentiality agreement where only one party discloses confidential information.",
        category: "Business / Corporate",
        fields: [
            {
                id: "disclosingParty",
                label: "Disclosing Party",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "disclosingPartyAddress",
                label: "Disclosing Party Address",
                type: "textarea",
                section: "Parties",
            },
            {
                id: "receivingParty",
                label: "Receiving Party",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "receivingPartyAddress",
                label: "Receiving Party Address",
                type: "textarea",
                section: "Parties",
            },
            {
                id: "purpose",
                label: "Purpose of Disclosure",
                type: "textarea",
                placeholder: "e.g. Product demo, due diligence, contractor access",
                required: true,
                section: "Purpose",
            },
            {
                id: "duration",
                label: "Agreement Duration",
                type: "text",
                placeholder: "e.g. 1 year",
                required: true,
                section: "Term",
            },
            {
                id: "returnOrDestroyInfo",
                label: "Return or Destroy Information on Request",
                type: "checkbox",
                defaultValue: true,
                section: "Confidentiality Scope",
            },
            ...commonMetaFields,
        ],
    },

    "Service Agreement": {
        key: "Service Agreement",
        label: "Service Agreement",
        description:
            "General agreement for provision of services by one party to another.",
        category: "Business / Corporate",
        fields: [
            {
                id: "serviceProvider",
                label: "Service Provider Name",
                type: "text",
                placeholder: "e.g. Acme Tech Solutions",
                required: true,
                section: "Parties",
            },
            {
                id: "serviceProviderAddress",
                label: "Service Provider Address",
                type: "textarea",
                section: "Parties",
            },
            {
                id: "clientName",
                label: "Client Name",
                type: "text",
                placeholder: "e.g. Globex Corporation",
                required: true,
                section: "Parties",
            },
            {
                id: "clientAddress",
                label: "Client Address",
                type: "textarea",
                section: "Parties",
            },
            {
                id: "serviceDescription",
                label: "Description of Services",
                type: "textarea",
                placeholder:
                    "Describe in detail the services to be provided, scope, deliverables, and expectations",
                required: true,
                section: "Scope",
            },
            {
                id: "deliverables",
                label: "Deliverables",
                type: "textarea",
                placeholder: "List the outputs to be delivered",
                required: false,
                section: "Scope",
            },
            {
                id: "timeline",
                label: "Timeline / Milestones",
                type: "textarea",
                placeholder: "e.g. Discovery - Week 1, Design - Week 2-3, Delivery - Week 4",
                section: "Scope",
            },
            {
                id: "compensation",
                label: "Compensation / Fee",
                type: "text",
                placeholder: "e.g. $5,000 fixed fee or $100/hour",
                required: true,
                section: "Payment",
            },
            {
                id: "paymentSchedule",
                label: "Payment Schedule",
                type: "textarea",
                placeholder: "e.g. 50% upfront, 50% on delivery",
                required: false,
                section: "Payment",
            },
            {
                id: "lateFee",
                label: "Late Fee Terms",
                type: "text",
                placeholder: "e.g. 2% per month on overdue invoices",
                required: false,
                section: "Payment",
            },
            {
                id: "termType",
                label: "Term Type",
                type: "select",
                required: false,
                section: "Term",
                options: [
                    { label: "Fixed Term", value: "fixed" },
                    { label: "Ongoing / Indefinite", value: "ongoing" },
                ],
            },
            {
                id: "terminationNotice",
                label: "Termination Notice Period",
                type: "text",
                placeholder: "e.g. 14 days written notice",
                required: false,
                section: "Term",
            },
            {
                id: "intellectualProperty",
                label: "Intellectual Property Ownership",
                type: "textarea",
                placeholder:
                    "e.g. Client owns all work product upon full payment, provider retains pre-existing IP",
                required: false,
                section: "IP",
            },
            {
                id: "confidentialityRequired",
                label: "Include Confidentiality Clause",
                type: "checkbox",
                defaultValue: true,
                section: "Confidentiality",
            },
            ...commonMetaFields,
            {
                id: "startDate",
                label: "Service Start Date",
                type: "date",
                required: true,
                section: "General",
            },
        ],
    },

    "Master Services Agreement (MSA)": {
        key: "Master Services Agreement (MSA)",
        label: "Master Services Agreement (MSA)",
        description:
            "Framework agreement governing future service engagements, typically used with SOWs.",
        category: "Business / Corporate",
        fields: [
            {
                id: "providerName",
                label: "Provider Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "providerAddress",
                label: "Provider Address",
                type: "textarea",
                section: "Parties",
            },
            {
                id: "clientName",
                label: "Client Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "clientAddress",
                label: "Client Address",
                type: "textarea",
                section: "Parties",
            },
            {
                id: "servicesOverview",
                label: "General Services Overview",
                type: "textarea",
                placeholder: "High-level nature of services covered under this MSA",
                section: "Scope",
            },
            {
                id: "paymentTerms",
                label: "Payment Terms",
                type: "text",
                placeholder: "e.g. Net 30",
                required: true,
                section: "Payment",
            },
            {
                id: "invoicingMethod",
                label: "Invoicing Method",
                type: "textarea",
                placeholder: "e.g. Monthly invoicing based on approved SOW milestones",
                section: "Payment",
            },
            {
                id: "slaIncluded",
                label: "Include Service Levels / SLA",
                type: "checkbox",
                defaultValue: false,
                section: "Performance",
            },
            {
                id: "liabilityCap",
                label: "Liability Cap",
                type: "text",
                placeholder: "e.g. Total fees paid in the last 12 months",
                section: "Risk Allocation",
            },
            {
                id: "indemnityTerms",
                label: "Indemnity Terms",
                type: "textarea",
                placeholder: "Describe indemnification obligations if applicable",
                section: "Risk Allocation",
            },
            {
                id: "dataProtectionTerms",
                label: "Data Protection Requirements",
                type: "textarea",
                placeholder: "e.g. GDPR, CCPA, NDPR compliance obligations",
                section: "Compliance",
            },
            ...commonMetaFields,
        ],
    },

    "Statement of Work (SOW)": {
        key: "Statement of Work (SOW)",
        label: "Statement of Work (SOW)",
        description:
            "Detailed project-specific work order or service schedule under an MSA or standalone agreement.",
        category: "Business / Corporate",
        fields: [
            {
                id: "clientName",
                label: "Client Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "providerName",
                label: "Service Provider Name",
                type: "text",
                required: false,
                section: "Parties",
            },
            {
                id: "projectName",
                label: "Project Name",
                type: "text",
                required: true,
                section: "Project Details",
            },
            {
                id: "projectDescription",
                label: "Project Description",
                type: "textarea",
                required: true,
                section: "Project Details",
            },
            {
                id: "deliverables",
                label: "Key Deliverables",
                type: "textarea",
                required: true,
                section: "Scope",
            },
            {
                id: "assumptions",
                label: "Project Assumptions / Dependencies",
                type: "textarea",
                required: false,
                section: "Scope",
            },
            {
                id: "timeline",
                label: "Timeline",
                type: "textarea",
                required: true,
                section: "Schedule",
            },
            {
                id: "milestones",
                label: "Milestones",
                type: "textarea",
                section: "Schedule",
            },
            {
                id: "budget",
                label: "Budget",
                type: "text",
                required: true,
                section: "Payment",
            },
            {
                id: "acceptanceCriteria",
                label: "Acceptance Criteria",
                type: "textarea",
                placeholder: "How deliverables will be reviewed and accepted",
                section: "Acceptance",
            },
            ...commonMetaFields,
        ],
    },

    "Consulting Agreement": {
        key: "Consulting Agreement",
        label: "Consulting Agreement",
        description:
            "Agreement for consulting or advisory services rendered by an independent consultant.",
        category: "Business / Corporate",
        fields: [
            {
                id: "consultantName",
                label: "Consultant Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "consultantAddress",
                label: "Consultant Address",
                type: "textarea",
                section: "Parties",
            },
            {
                id: "clientName",
                label: "Client Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "scopeOfWork",
                label: "Scope of Work",
                type: "textarea",
                required: true,
                section: "Scope",
            },
            {
                id: "hourlyRate",
                label: "Hourly Rate / Fee",
                type: "text",
                placeholder: "e.g. $150/hour",
                required: true,
                section: "Payment",
            },
            {
                id: "expenseReimbursement",
                label: "Expense Reimbursement Terms",
                type: "textarea",
                section: "Payment",
            },
            {
                id: "consultingTerm",
                label: "Consulting Term",
                type: "text",
                placeholder: "e.g. 6 months",
                section: "Term",
            },
            {
                id: "nonCompeteRequired",
                label: "Include Non-Compete Clause",
                type: "checkbox",
                defaultValue: false,
                section: "Restrictions",
            },
            ...commonMetaFields,
        ],
    },

    "Independent Contractor Agreement": {
        key: "Independent Contractor Agreement",
        label: "Independent Contractor Agreement",
        description:
            "Agreement with an independent contractor for specified services.",
        category: "Business / Corporate",
        fields: [
            {
                id: "contractorName",
                label: "Contractor Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "contractorAddress",
                label: "Contractor Address",
                type: "textarea",
                section: "Parties",
            },
            {
                id: "companyName",
                label: "Company Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "services",
                label: "Services Provided",
                type: "textarea",
                required: true,
                section: "Scope",
            },
            {
                id: "compensation",
                label: "Compensation",
                type: "text",
                required: true,
                section: "Payment",
            },
            {
                id: "paymentFrequency",
                label: "Payment Frequency",
                type: "select",
                section: "Payment",
                options: [
                    { label: "One-time", value: "one_time" },
                    { label: "Weekly", value: "weekly" },
                    { label: "Bi-weekly", value: "bi_weekly" },
                    { label: "Monthly", value: "monthly" },
                    { label: "Per Milestone", value: "milestone" },
                ],
            },
            {
                id: "toolsProvidedBy",
                label: "Who Provides Tools / Equipment",
                type: "text",
                placeholder: "e.g. Contractor, Company, Shared",
                section: "Operational Terms",
            },
            {
                id: "taxResponsibility",
                label: "Tax Responsibility Statement",
                type: "textarea",
                placeholder: "Describe contractor responsibility for taxes and filings",
                section: "Operational Terms",
            },
            ...commonMetaFields,
        ],
    },

    "Partnership Agreement": {
        key: "Partnership Agreement",
        label: "Partnership Agreement",
        description:
            "Agreement governing a business partnership between two or more partners.",
        category: "Business / Corporate",
        fields: [
            {
                id: "businessName",
                label: "Business Name",
                type: "text",
                required: true,
                section: "Business",
            },
            {
                id: "partnerA",
                label: "Partner A Name",
                type: "text",
                required: true,
                section: "Partners",
            },
            {
                id: "partnerB",
                label: "Partner B Name",
                type: "text",
                required: true,
                section: "Partners",
            },
            {
                id: "additionalPartners",
                label: "Additional Partners",
                type: "textarea",
                placeholder: "Add more partner names if any",
                section: "Partners",
            },
            {
                id: "businessPurpose",
                label: "Business Purpose",
                type: "textarea",
                required: true,
                section: "Business",
            },
            {
                id: "capitalContributions",
                label: "Capital Contributions",
                type: "textarea",
                placeholder: "Describe who contributes what, including cash, assets, IP, labor",
                required: true,
                section: "Economics",
            },
            {
                id: "profitShare",
                label: "Profit Share Ratio",
                type: "text",
                placeholder: "e.g. 50/50 or 60/40",
                required: true,
                section: "Economics",
            },
            {
                id: "lossShare",
                label: "Loss Share Ratio",
                type: "text",
                placeholder: "e.g. same as profit share unless otherwise agreed",
                section: "Economics",
            },
            {
                id: "managementStructure",
                label: "Management Structure",
                type: "textarea",
                placeholder: "Describe decision-making authority and voting",
                section: "Governance",
            },
            {
                id: "partnerWithdrawal",
                label: "Withdrawal / Exit Terms",
                type: "textarea",
                section: "Exit",
            },
            {
                id: "disputeResolution",
                label: "Dispute Resolution Method",
                type: "select",
                section: "Disputes",
                options: [
                    { label: "Negotiation", value: "negotiation" },
                    { label: "Mediation", value: "mediation" },
                    { label: "Arbitration", value: "arbitration" },
                    { label: "Court Litigation", value: "litigation" },
                ],
            },
            ...commonMetaFields,
        ],
    },

    "Joint Venture Agreement": {
        key: "Joint Venture Agreement",
        label: "Joint Venture Agreement",
        description:
            "Agreement between parties to collaborate on a specific project or venture.",
        category: "Business / Corporate",
        fields: [
            {
                id: "partyA",
                label: "Party A",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "partyB",
                label: "Party B",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "venturePurpose",
                label: "Venture Purpose",
                type: "textarea",
                required: true,
                section: "Venture",
            },
            {
                id: "investment",
                label: "Capital Investment / Contributions",
                type: "textarea",
                required: true,
                section: "Economics",
            },
            {
                id: "ownershipSplit",
                label: "Ownership / Participation Split",
                type: "text",
                placeholder: "e.g. 50/50",
                section: "Economics",
            },
            {
                id: "managementCommittee",
                label: "Management / Oversight Structure",
                type: "textarea",
                section: "Governance",
            },
            {
                id: "ventureDuration",
                label: "Joint Venture Duration",
                type: "text",
                placeholder: "e.g. Until project completion or 3 years",
                section: "Term",
            },
            ...commonMetaFields,
        ],
    },

    "Shareholders Agreement": {
        key: "Shareholders Agreement",
        label: "Shareholders Agreement",
        description:
            "Agreement among shareholders governing ownership, voting, transfers, and control rights.",
        category: "Business / Corporate",
        fields: [
            {
                id: "companyName",
                label: "Company Name",
                type: "text",
                required: true,
                section: "Company",
            },
            {
                id: "shareholders",
                label: "Shareholder Names",
                type: "textarea",
                placeholder: "List all shareholders and their holdings",
                required: true,
                section: "Shareholders",
            },
            {
                id: "totalShares",
                label: "Total Shares Authorized",
                type: "text",
                required: true,
                section: "Capitalization",
            },
            {
                id: "shareClasses",
                label: "Share Classes",
                type: "textarea",
                placeholder: "e.g. Ordinary, Preferred",
                section: "Capitalization",
            },
            {
                id: "transferRestrictions",
                label: "Restrictions on Transfer",
                type: "textarea",
                section: "Transfers",
            },
            {
                id: "dragAlong",
                label: "Include Drag-Along Rights",
                type: "checkbox",
                defaultValue: false,
                section: "Transfers",
            },
            {
                id: "tagAlong",
                label: "Include Tag-Along Rights",
                type: "checkbox",
                defaultValue: false,
                section: "Transfers",
            },
            {
                id: "reservedMatters",
                label: "Reserved Matters / Special Approval Rights",
                type: "textarea",
                section: "Governance",
            },
            ...commonMetaFields,
        ],
    },

    "Operating Agreement (LLC)": {
        key: "Operating Agreement (LLC)",
        label: "Operating Agreement (LLC)",
        description:
            "Agreement governing operations, membership, and management of an LLC.",
        category: "Business / Corporate",
        fields: [
            {
                id: "llcName",
                label: "LLC Name",
                type: "text",
                required: true,
                section: "Company",
            },
            {
                id: "formationState",
                label: "State / Jurisdiction of Formation",
                type: "text",
                required: true,
                section: "Company",
            },
            {
                id: "members",
                label: "Member Names",
                type: "textarea",
                required: true,
                section: "Members",
            },
            {
                id: "managementType",
                label: "Management Type",
                type: "select",
                required: true,
                section: "Management",
                options: [
                    { label: "Member-managed", value: "member_managed" },
                    { label: "Manager-managed", value: "manager_managed" },
                ],
            },
            {
                id: "capitalContributions",
                label: "Capital Contributions",
                type: "textarea",
                section: "Economics",
            },
            {
                id: "profitLossAllocation",
                label: "Profit / Loss Allocation",
                type: "textarea",
                section: "Economics",
            },
            {
                id: "memberVoting",
                label: "Voting Rights",
                type: "textarea",
                section: "Governance",
            },
            ...commonMetaFields,
        ],
    },

    "Subscription / SaaS Agreement": {
        key: "Subscription / SaaS Agreement",
        label: "Subscription / SaaS Agreement",
        description:
            "Agreement governing subscription access to software services.",
        category: "Business / Corporate",
        fields: [
            {
                id: "providerName",
                label: "SaaS Provider",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "customerName",
                label: "Customer Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "serviceName",
                label: "Software / Service Name",
                type: "text",
                required: true,
                section: "Service",
            },
            {
                id: "subscriptionPlan",
                label: "Subscription Plan",
                type: "text",
                placeholder: "e.g. Pro, Business, Enterprise",
                section: "Service",
            },
            {
                id: "subscriptionFee",
                label: "Subscription Fee",
                type: "text",
                required: true,
                section: "Payment",
            },
            {
                id: "billingCycle",
                label: "Billing Cycle",
                type: "select",
                required: true,
                section: "Payment",
                options: [
                    { label: "Monthly", value: "monthly" },
                    { label: "Quarterly", value: "quarterly" },
                    { label: "Annual", value: "annual" },
                    { label: "Custom", value: "custom" },
                ],
            },
            {
                id: "renewalTerm",
                label: "Renewal Term",
                type: "text",
                placeholder: "e.g. Auto-renews annually",
                required: false,
                section: "Term",
            },
            {
                id: "slaCommitments",
                label: "Service Availability / SLA",
                type: "textarea",
                placeholder: "e.g. 99.9% uptime",
                section: "Performance",
            },
            {
                id: "supportTerms",
                label: "Support Terms",
                type: "textarea",
                placeholder: "e.g. Email support during business hours",
                section: "Support",
            },
            {
                id: "dataOwnership",
                label: "Customer Data Ownership Terms",
                type: "textarea",
                section: "Data & IP",
            },
            ...commonMetaFields,
        ],
    },

    "Vendor / Supplier Agreement": {
        key: "Vendor / Supplier Agreement",
        label: "Vendor / Supplier Agreement",
        description:
            "Agreement for supply of goods or products by a vendor or supplier.",
        category: "Business / Corporate",
        fields: [
            {
                id: "supplierName",
                label: "Supplier Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "purchaserName",
                label: "Purchaser Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "goods",
                label: "Goods / Products to Supply",
                type: "textarea",
                required: true,
                section: "Goods",
            },
            {
                id: "specifications",
                label: "Specifications / Quality Standards",
                type: "textarea",
                section: "Goods",
            },
            {
                id: "pricing",
                label: "Pricing / Cost",
                type: "text",
                required: true,
                section: "Commercial Terms",
            },
            {
                id: "deliveryTerms",
                label: "Delivery Terms",
                type: "textarea",
                placeholder: "e.g. FOB, delivery within 10 business days",
                section: "Commercial Terms",
            },
            {
                id: "inspectionRights",
                label: "Inspection / Rejection Rights",
                type: "textarea",
                section: "Commercial Terms",
            },
            ...commonMetaFields,
        ],
    },

    // =========================
    // EMPLOYMENT / HR
    // =========================
    "Employment Offer Letter": {
        key: "Employment Offer Letter",
        label: "Employment Offer Letter",
        description:
            "Offer letter for a prospective employee outlining compensation and role details.",
        category: "Employment / HR",
        fields: [
            {
                id: "employerName",
                label: "Employer Name",
                type: "text",
                required: true,
                section: "Employer",
            },
            {
                id: "employeeName",
                label: "Candidate Name",
                type: "text",
                required: true,
                section: "Candidate",
            },
            {
                id: "jobTitle",
                label: "Job Title",
                type: "text",
                required: true,
                section: "Role",
            },
            {
                id: "department",
                label: "Department",
                type: "text",
                section: "Role",
            },
            {
                id: "managerName",
                label: "Reporting Manager",
                type: "text",
                section: "Role",
            },
            {
                id: "employmentType",
                label: "Employment Type",
                type: "select",
                section: "Role",
                options: [
                    { label: "Full-Time", value: "full_time" },
                    { label: "Part-Time", value: "part_time" },
                    { label: "Contract", value: "contract" },
                    { label: "Temporary", value: "temporary" },
                ],
            },
            {
                id: "startDate",
                label: "Start Date",
                type: "date",
                required: true,
                section: "Role",
            },
            {
                id: "salary",
                label: "Base Salary / Compensation",
                type: "text",
                required: true,
                section: "Compensation",
            },
            {
                id: "bonus",
                label: "Bonus / Incentive",
                type: "text",
                section: "Compensation",
            },
            {
                id: "benefits",
                label: "Key Benefits",
                type: "textarea",
                placeholder: "e.g. Health insurance, pension, annual leave",
                section: "Benefits",
            },
            {
                id: "probationPeriod",
                label: "Probation Period",
                type: "text",
                placeholder: "e.g. 3 months",
                section: "Employment Terms",
            },
            {
                id: "workLocation",
                label: "Work Location",
                type: "text",
                placeholder: "e.g. Lagos, Hybrid, Remote",
                section: "Employment Terms",
            },
        ],
    },

    "Employment Agreement": {
        key: "Employment Agreement",
        label: "Employment Agreement",
        description:
            "Detailed employment contract setting out role, obligations, compensation, and policies.",
        category: "Employment / HR",
        fields: [
            {
                id: "employerName",
                label: "Employer Name",
                type: "text",
                required: true,
                section: "Employer",
            },
            {
                id: "employeeName",
                label: "Employee Name",
                type: "text",
                required: true,
                section: "Employee",
            },
            {
                id: "jobTitle",
                label: "Job Title",
                type: "text",
                required: true,
                section: "Role",
            },
            {
                id: "jobDescription",
                label: "Job Description / Duties",
                type: "textarea",
                required: false,
                section: "Role",
            },
            {
                id: "startDate",
                label: "Start Date",
                type: "date",
                required: true,
                section: "Role",
            },
            {
                id: "salary",
                label: "Salary Amount",
                type: "text",
                required: true,
                section: "Compensation",
            },
            {
                id: "paymentFrequency",
                label: "Salary Payment Frequency",
                type: "select",
                section: "Compensation",
                options: [
                    { label: "Weekly", value: "weekly" },
                    { label: "Bi-weekly", value: "bi_weekly" },
                    { label: "Monthly", value: "monthly" },
                ],
            },
            {
                id: "employmentType",
                label: "Employment Type",
                type: "text",
                placeholder: "e.g. Full-Time, At-Will, Permanent",
                required: true,
                section: "Employment Terms",
            },
            {
                id: "leaveEntitlement",
                label: "Leave / PTO Entitlement",
                type: "text",
                placeholder: "e.g. 20 working days per year",
                section: "Benefits",
            },
            {
                id: "confidentialityObligations",
                label: "Confidentiality Obligations",
                type: "textarea",
                section: "Restrictions",
            },
            {
                id: "terminationTerms",
                label: "Termination Terms",
                type: "textarea",
                section: "Termination",
            },
            ...commonMetaFields,
        ],
    },

    "Non-Compete Agreement": {
        key: "Non-Compete Agreement",
        label: "Non-Compete Agreement",
        description:
            "Restrictive covenant limiting competitive activities after employment or engagement.",
        category: "Employment / HR",
        fields: [
            {
                id: "employerName",
                label: "Employer Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "employeeName",
                label: "Employee / Contractor Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "duration",
                label: "Restriction Duration After Termination",
                type: "text",
                placeholder: "e.g. 12 months",
                required: true,
                section: "Restriction Scope",
            },
            {
                id: "territory",
                label: "Geographic Territory",
                type: "text",
                placeholder: "e.g. Lagos State, Nigeria, North America",
                required: true,
                section: "Restriction Scope",
            },
            {
                id: "restrictedBusiness",
                label: "Restricted Business / Activities",
                type: "textarea",
                required: true,
                section: "Restriction Scope",
            },
            ...commonMetaFields,
        ],
    },

    "Non-Solicitation Agreement": {
        key: "Non-Solicitation Agreement",
        label: "Non-Solicitation Agreement",
        description:
            "Restrictive covenant preventing solicitation of clients, customers, or employees.",
        category: "Employment / HR",
        fields: [
            {
                id: "employerName",
                label: "Employer Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "employeeName",
                label: "Employee / Contractor Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "duration",
                label: "Restriction Duration",
                type: "text",
                placeholder: "e.g. 24 months",
                required: true,
                section: "Restriction Scope",
            },
            {
                id: "restrictedContacts",
                label: "Who May Not Be Solicited",
                type: "textarea",
                placeholder: "e.g. employees, customers, vendors, strategic partners",
                required: true,
                section: "Restriction Scope",
            },
            ...commonMetaFields,
        ],
    },

    "Employee Handbook Policy": {
        key: "Employee Handbook Policy",
        label: "Employee Handbook Policy",
        description:
            "Policy document or handbook section covering an employment topic.",
        category: "Employment / HR",
        fields: [
            {
                id: "companyName",
                label: "Company Name",
                type: "text",
                required: true,
                section: "Organization",
            },
            {
                id: "policyTopic",
                label: "Policy Topic",
                type: "text",
                placeholder: "e.g. Remote Work Policy, Leave Policy, Code of Conduct",
                required: true,
                section: "Policy Details",
            },
            {
                id: "policyPurpose",
                label: "Purpose of Policy",
                type: "textarea",
                required: false,
                section: "Policy Details",
            },
            {
                id: "policyRules",
                label: "Policy Rules / Standards",
                type: "textarea",
                required: true,
                section: "Policy Content",
            },
            {
                id: "disciplinaryAction",
                label: "Disciplinary Consequences",
                type: "textarea",
                section: "Enforcement",
            },
            {
                id: "effectiveDate",
                label: "Policy Effective Date",
                type: "date",
                section: "Policy Details",
            },
        ],
    },

    "Termination Letter": {
        key: "Termination Letter",
        label: "Termination Letter",
        description:
            "Letter notifying an employee or worker of termination of employment or engagement.",
        category: "Employment / HR",
        fields: [
            {
                id: "employerName",
                label: "Company Name",
                type: "text",
                required: true,
                section: "Employer",
            },
            {
                id: "employeeName",
                label: "Employee Name",
                type: "text",
                required: true,
                section: "Employee",
            },
            {
                id: "terminationDate",
                label: "Effective Date of Termination",
                type: "date",
                required: true,
                section: "Termination",
            },
            {
                id: "reason",
                label: "Reason for Termination",
                type: "textarea",
                required: false,
                section: "Termination",
            },
            {
                id: "severance",
                label: "Severance Package",
                type: "textarea",
                required: false,
                section: "Separation Terms",
            },
            {
                id: "returnCompanyProperty",
                label: "Return of Company Property Instructions",
                type: "textarea",
                section: "Separation Terms",
            },
            {
                id: "finalPayDetails",
                label: "Final Pay Details",
                type: "textarea",
                section: "Separation Terms",
            },
        ],
    },

    "Intern Agreement": {
        key: "Intern Agreement",
        label: "Intern Agreement",
        description:
            "Agreement governing an internship relationship, paid or unpaid.",
        category: "Employment / HR",
        fields: [
            {
                id: "companyName",
                label: "Company Name",
                type: "text",
                required: true,
                section: "Organization",
            },
            {
                id: "internName",
                label: "Intern Name",
                type: "text",
                required: true,
                section: "Intern",
            },
            {
                id: "mentorName",
                label: "Supervisor / Mentor",
                type: "text",
                section: "Internship Details",
            },
            {
                id: "internshipRole",
                label: "Internship Role / Title",
                type: "text",
                section: "Internship Details",
            },
            {
                id: "startDate",
                label: "Start Date",
                type: "date",
                required: true,
                section: "Internship Details",
            },
            {
                id: "endDate",
                label: "End Date",
                type: "date",
                required: true,
                section: "Internship Details",
            },
            {
                id: "compensation",
                label: "Compensation (if paid)",
                type: "text",
                placeholder: "Leave blank if unpaid",
                section: "Compensation",
            },
            {
                id: "learningObjectives",
                label: "Learning Objectives",
                type: "textarea",
                section: "Internship Details",
            },
        ],
    },

    // =========================
    // WEB / PRODUCT / COMPLIANCE
    // =========================
    "Terms of Service": {
        key: "Terms of Service",
        label: "Terms of Service",
        description:
            "Terms governing use of a website, app, or online service.",
        category: "Web / Product / Compliance",
        fields: [
            {
                id: "companyName",
                label: "Company Name",
                type: "text",
                required: true,
                section: "Company",
            },
            {
                id: "websiteName",
                label: "Website / App Name",
                type: "text",
                required: true,
                section: "Service",
            },
            {
                id: "websiteUrl",
                label: "Website URL",
                type: "url",
                section: "Service",
            },
            {
                id: "serviceDescription",
                label: "Description of Service",
                type: "textarea",
                section: "Service",
            },
            {
                id: "governingState",
                label: "Governing Law (State/Country)",
                type: "text",
                required: true,
                section: "Legal Terms",
            },
            {
                id: "contactEmail",
                label: "Contact Email",
                type: "email",
                required: true,
                section: "Company",
            },
            {
                id: "userObligations",
                label: "User Obligations",
                type: "textarea",
                section: "User Conduct",
            },
            {
                id: "prohibitedUses",
                label: "Prohibited Uses",
                type: "textarea",
                section: "User Conduct",
            },
            {
                id: "limitationOfLiability",
                label: "Limitation of Liability Terms",
                type: "textarea",
                section: "Legal Terms",
            },
            {
                id: "terminationRights",
                label: "Account Suspension / Termination Rights",
                type: "textarea",
                section: "Legal Terms",
            },
        ],
    },

    "Privacy Policy": {
        key: "Privacy Policy",
        label: "Privacy Policy",
        description:
            "Policy explaining collection, use, and protection of personal data.",
        category: "Web / Product / Compliance",
        fields: [
            {
                id: "companyName",
                label: "Company Name",
                type: "text",
                required: true,
                section: "Company",
            },
            {
                id: "websiteName",
                label: "Website / App Name",
                type: "text",
                required: true,
                section: "Service",
            },
            {
                id: "websiteUrl",
                label: "Website URL",
                type: "url",
                section: "Service",
            },
            {
                id: "dataCollected",
                label: "Data Collected",
                type: "textarea",
                placeholder: "e.g. Name, email, IP address, usage data, payment details",
                required: true,
                section: "Data Collection",
            },
            {
                id: "collectionMethods",
                label: "How Data is Collected",
                type: "textarea",
                placeholder: "e.g. signup forms, cookies, analytics tools, support requests",
                section: "Data Collection",
            },
            {
                id: "dataUsePurpose",
                label: "Purpose of Data Use",
                type: "textarea",
                required: true,
                section: "Use of Data",
            },
            {
                id: "thirdPartySharing",
                label: "Third-Party Sharing Details",
                type: "textarea",
                section: "Sharing",
            },
            {
                id: "internationalTransfers",
                label: "International Data Transfers",
                type: "textarea",
                section: "Data Transfers",
            },
            {
                id: "retentionPeriod",
                label: "Data Retention Period",
                type: "text",
                placeholder: "e.g. retained while account is active and for 6 years thereafter",
                section: "Retention",
            },
            {
                id: "userRights",
                label: "User Data Rights",
                type: "textarea",
                placeholder: "e.g. access, correction, deletion, objection, portability",
                section: "User Rights",
            },
            {
                id: "address",
                label: "Physical Address",
                type: "textarea",
                required: false,
                section: "Company",
            },
            {
                id: "contactEmail",
                label: "Privacy Contact Email",
                type: "email",
                required: true,
                section: "Company",
            },
            {
                id: "applicableLaws",
                label: "Applicable Privacy Laws",
                type: "text",
                placeholder: "e.g. GDPR, CCPA, NDPR",
                section: "Compliance",
            },
        ],
    },

    "Cookie Policy": {
        key: "Cookie Policy",
        label: "Cookie Policy",
        description:
            "Policy disclosing use of cookies and tracking technologies.",
        category: "Web / Product / Compliance",
        fields: [
            {
                id: "companyName",
                label: "Company Name",
                type: "text",
                required: true,
                section: "Company",
            },
            {
                id: "websiteName",
                label: "Website Name",
                type: "text",
                required: true,
                section: "Service",
            },
            {
                id: "cookieTypes",
                label: "Types of Cookies Used",
                type: "textarea",
                placeholder: "e.g. Essential, analytics, performance, advertising",
                required: true,
                section: "Cookies",
            },
            {
                id: "cookiePurpose",
                label: "Purpose of Cookies",
                type: "textarea",
                section: "Cookies",
            },
            {
                id: "thirdPartyCookies",
                label: "Third-Party Cookies",
                type: "textarea",
                section: "Cookies",
            },
            {
                id: "cookieControlMethod",
                label: "How Users Can Control Cookies",
                type: "textarea",
                section: "User Choices",
            },
        ],
    },

    "EULA (Software License)": {
        key: "EULA (Software License)",
        label: "EULA (Software License)",
        description:
            "End User License Agreement for software, app, or digital product.",
        category: "Web / Product / Compliance",
        fields: [
            {
                id: "licensorName",
                label: "Software Provider / Licensor",
                type: "text",
                required: true,
                section: "Licensor",
            },
            {
                id: "appName",
                label: "Software / App Name",
                type: "text",
                required: true,
                section: "Software",
            },
            {
                id: "licenseType",
                label: "License Type",
                type: "text",
                placeholder: "e.g. Single-user, non-exclusive, revocable",
                required: true,
                section: "License",
            },
            {
                id: "permittedUse",
                label: "Permitted Use",
                type: "textarea",
                section: "License",
            },
            {
                id: "restrictions",
                label: "Restrictions",
                type: "textarea",
                placeholder: "e.g. no reverse engineering, no sublicensing",
                section: "License",
            },
            {
                id: "terminationConditions",
                label: "Termination Conditions",
                type: "textarea",
                section: "Termination",
            },
            ...commonMetaFields,
        ],
    },

    "Acceptable Use Policy": {
        key: "Acceptable Use Policy",
        label: "Acceptable Use Policy",
        description:
            "Rules governing acceptable and prohibited use of a service or platform.",
        category: "Web / Product / Compliance",
        fields: [
            {
                id: "companyName",
                label: "Company Name",
                type: "text",
                required: true,
                section: "Company",
            },
            {
                id: "serviceName",
                label: "Service Name",
                type: "text",
                required: true,
                section: "Service",
            },
            {
                id: "prohibitedActions",
                label: "Main Prohibited Actions",
                type: "textarea",
                placeholder: "e.g. spamming, malware distribution, abusive conduct, fraud",
                required: true,
                section: "Rules",
            },
            {
                id: "enforcementActions",
                label: "Enforcement / Consequences",
                type: "textarea",
                section: "Enforcement",
            },
            {
                id: "reportingEmail",
                label: "Abuse Reporting Email",
                type: "email",
                section: "Enforcement",
            },
        ],
    },

    "Data Processing Agreement (DPA)": {
        key: "Data Processing Agreement (DPA)",
        label: "Data Processing Agreement (DPA)",
        description:
            "Agreement between data controller and processor covering processing of personal data.",
        category: "Web / Product / Compliance",
        fields: [
            {
                id: "controllerName",
                label: "Data Controller",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "processorName",
                label: "Data Processor",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "processingDescription",
                label: "Description of Processing",
                type: "textarea",
                required: true,
                section: "Processing Details",
            },
            {
                id: "dataSubjects",
                label: "Data Subjects",
                type: "text",
                placeholder: "e.g. employees, customers, app users",
                required: true,
                section: "Processing Details",
            },
            {
                id: "dataCategories",
                label: "Categories of Personal Data",
                type: "textarea",
                section: "Processing Details",
            },
            {
                id: "securityMeasures",
                label: "Technical and Organizational Security Measures",
                type: "textarea",
                section: "Security",
            },
            {
                id: "subprocessorsAllowed",
                label: "Subprocessors Allowed",
                type: "checkbox",
                defaultValue: false,
                section: "Subprocessing",
            },
            {
                id: "dpaRegion",
                label: "Applicable Data Protection Law",
                type: "text",
                placeholder: "e.g. GDPR, CCPA, UK GDPR, NDPR",
                required: true,
                section: "Compliance",
            },
            ...commonMetaFields,
        ],
    },

    "Refund Policy": {
        key: "Refund Policy",
        label: "Refund Policy",
        description:
            "Policy describing refund eligibility, process, and limitations.",
        category: "Web / Product / Compliance",
        fields: [
            {
                id: "companyName",
                label: "Company Name",
                type: "text",
                required: true,
                section: "Company",
            },
            {
                id: "refundWindow",
                label: "Refund Window",
                type: "text",
                placeholder: "e.g. 14 days from purchase",
                required: true,
                section: "Refund Rules",
            },
            {
                id: "conditions",
                label: "Refund Conditions",
                type: "textarea",
                placeholder: "e.g. unused service, unopened product, proof of purchase required",
                required: true,
                section: "Refund Rules",
            },
            {
                id: "nonRefundableItems",
                label: "Non-Refundable Items / Services",
                type: "textarea",
                section: "Refund Rules",
            },
            {
                id: "contactEmail",
                label: "Customer Support Email",
                type: "email",
                required: true,
                section: "Support",
            },
            {
                id: "processingTime",
                label: "Refund Processing Time",
                type: "text",
                placeholder: "e.g. 5-10 business days",
                section: "Refund Process",
            },
        ],
    },

    // =========================
    // REAL ESTATE
    // =========================
    "Lease Agreement (Residential)": {
        key: "Lease Agreement (Residential)",
        label: "Lease Agreement (Residential)",
        description:
            "Residential tenancy or lease agreement between landlord and tenant.",
        category: "Real Estate",
        fields: [
            {
                id: "landlordName",
                label: "Landlord Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "tenantName",
                label: "Tenant Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "propertyAddress",
                label: "Property Address",
                type: "textarea",
                required: true,
                section: "Property",
            },
            {
                id: "rentAmount",
                label: "Monthly Rent",
                type: "text",
                required: true,
                section: "Financial Terms",
            },
            {
                id: "securityDeposit",
                label: "Security Deposit",
                type: "text",
                required: true,
                section: "Financial Terms",
            },
            {
                id: "leaseTerm",
                label: "Lease Term",
                type: "text",
                placeholder: "e.g. 12 months",
                required: true,
                section: "Term",
            },
            {
                id: "rentDueDate",
                label: "Rent Due Date",
                type: "text",
                placeholder: "e.g. 1st day of each month",
                section: "Financial Terms",
            },
            {
                id: "lateFee",
                label: "Late Fee",
                type: "text",
                section: "Financial Terms",
            },
            {
                id: "utilitiesResponsibility",
                label: "Utilities Responsibility",
                type: "textarea",
                section: "Property Terms",
            },
            {
                id: "petPolicy",
                label: "Pet Policy",
                type: "textarea",
                section: "Property Terms",
            },
            {
                id: "maintenanceResponsibility",
                label: "Maintenance / Repairs Responsibility",
                type: "textarea",
                section: "Property Terms",
            },
            ...commonMetaFields,
        ],
    },

    "Lease Agreement (Commercial)": {
        key: "Lease Agreement (Commercial)",
        label: "Lease Agreement (Commercial)",
        description:
            "Commercial lease agreement for business premises.",
        category: "Real Estate",
        fields: [
            {
                id: "landlordName",
                label: "Landlord Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "businessTenant",
                label: "Business Tenant Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "propertyAddress",
                label: "Premises Address",
                type: "textarea",
                required: true,
                section: "Premises",
            },
            {
                id: "rentAmount",
                label: "Base Rent",
                type: "text",
                required: true,
                section: "Financial Terms",
            },
            {
                id: "additionalRent",
                label: "Additional Rent / Service Charge",
                type: "text",
                section: "Financial Terms",
            },
            {
                id: "permittedUse",
                label: "Permitted Business Use",
                type: "textarea",
                required: true,
                section: "Use",
            },
            {
                id: "leaseTerm",
                label: "Lease Term",
                type: "text",
                required: true,
                section: "Term",
            },
            {
                id: "renewalOption",
                label: "Renewal Option",
                type: "textarea",
                section: "Term",
            },
            ...commonMetaFields,
        ],
    },

    "Rental Addendum": {
        key: "Rental Addendum",
        label: "Rental Addendum",
        description:
            "Supplemental addendum modifying or adding terms to an existing lease.",
        category: "Real Estate",
        fields: [
            {
                id: "landlordName",
                label: "Landlord Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "tenantName",
                label: "Tenant Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "propertyAddress",
                label: "Property Address",
                type: "textarea",
                required: true,
                section: "Property",
            },
            {
                id: "addendumTopic",
                label: "Addendum Topic",
                type: "text",
                placeholder: "e.g. Pet Policy, Parking, Guest Rules",
                required: true,
                section: "Addendum",
            },
            {
                id: "addendumTerms",
                label: "Addendum Terms",
                type: "textarea",
                required: true,
                section: "Addendum",
            },
            ...commonMetaFields,
        ],
    },

    "Property Management Agreement": {
        key: "Property Management Agreement",
        label: "Property Management Agreement",
        description:
            "Agreement appointing a manager to manage real estate on behalf of the owner.",
        category: "Real Estate",
        fields: [
            {
                id: "ownerName",
                label: "Property Owner Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "managerName",
                label: "Management Company / Manager",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "propertyAddress",
                label: "Property Address",
                type: "textarea",
                required: true,
                section: "Property",
            },
            {
                id: "managementFee",
                label: "Management Fee",
                type: "text",
                placeholder: "e.g. 10% of gross rent",
                required: true,
                section: "Fees",
            },
            {
                id: "managerDuties",
                label: "Manager Duties",
                type: "textarea",
                required: true,
                section: "Services",
            },
            {
                id: "expenseAuthorityLimit",
                label: "Expense Approval Limit",
                type: "text",
                placeholder: "e.g. Up to $500 without prior owner approval",
                section: "Authority",
            },
            ...commonMetaFields,
        ],
    },

    // =========================
    // FINANCE / PAYMENTS
    // =========================
    "Loan Agreement": {
        key: "Loan Agreement",
        label: "Loan Agreement",
        description:
            "Agreement documenting a loan between lender and borrower.",
        category: "Finance / Payments",
        fields: [
            {
                id: "lenderName",
                label: "Lender Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "borrowerName",
                label: "Borrower Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "loanAmount",
                label: "Principal Amount",
                type: "text",
                required: true,
                section: "Loan Terms",
            },
            {
                id: "interestRate",
                label: "Interest Rate (%)",
                type: "text",
                required: true,
                section: "Loan Terms",
            },
            {
                id: "repaymentDate",
                label: "Repayment Date",
                type: "date",
                required: true,
                section: "Repayment",
            },
            {
                id: "repaymentSchedule",
                label: "Repayment Schedule",
                type: "textarea",
                placeholder: "e.g. monthly installments, lump sum at maturity",
                section: "Repayment",
            },
            {
                id: "securityCollateral",
                label: "Collateral / Security",
                type: "textarea",
                section: "Security",
            },
            {
                id: "defaultTerms",
                label: "Default Terms",
                type: "textarea",
                section: "Default",
            },
            ...commonMetaFields,
        ],
    },

    "Promissory Note": {
        key: "Promissory Note",
        label: "Promissory Note",
        description:
            "Written promise by one party to pay a specified amount to another.",
        category: "Finance / Payments",
        fields: [
            {
                id: "payerName",
                label: "Maker / Payer Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "payeeName",
                label: "Payee Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "principal",
                label: "Principal Amount",
                type: "text",
                required: true,
                section: "Payment Terms",
            },
            {
                id: "interestRate",
                label: "Interest Rate",
                type: "text",
                section: "Payment Terms",
            },
            {
                id: "maturityDate",
                label: "Date of Maturity",
                type: "date",
                required: true,
                section: "Payment Terms",
            },
            {
                id: "paymentMethod",
                label: "Payment Method",
                type: "text",
                placeholder: "e.g. bank transfer",
                section: "Payment Terms",
            },
            ...commonMetaFields,
        ],
    },

    "Payment Terms Addendum": {
        key: "Payment Terms Addendum",
        label: "Payment Terms Addendum",
        description:
            "Addendum updating payment terms under an existing agreement.",
        category: "Finance / Payments",
        fields: [
            {
                id: "partyA",
                label: "Party A",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "partyB",
                label: "Party B",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "originalAgreement",
                label: "Original Agreement Reference",
                type: "text",
                placeholder: "e.g. Service Agreement dated Jan 1, 2026",
                required: true,
                section: "Reference",
            },
            {
                id: "newTerms",
                label: "New Payment Terms",
                type: "textarea",
                placeholder: "e.g. Net 60 instead of Net 30; milestone billing added",
                required: true,
                section: "Updated Terms",
            },
            ...commonMetaFields,
        ],
    },

    // =========================
    // EXTRA DOCUMENTS YOU SHOULD ADD
    // =========================
    "Sales Agreement": {
        key: "Sales Agreement",
        label: "Sales Agreement",
        description:
            "Agreement for sale and purchase of goods, products, or assets.",
        category: "Business / Corporate",
        fields: [
            {
                id: "sellerName",
                label: "Seller Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "buyerName",
                label: "Buyer Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "goodsDescription",
                label: "Description of Goods / Assets",
                type: "textarea",
                required: true,
                section: "Goods",
            },
            {
                id: "purchasePrice",
                label: "Purchase Price",
                type: "text",
                required: true,
                section: "Commercial Terms",
            },
            {
                id: "deliveryDate",
                label: "Delivery Date",
                type: "date",
                section: "Delivery",
            },
            {
                id: "warrantyTerms",
                label: "Warranty Terms",
                type: "textarea",
                section: "Warranties",
            },
            ...commonMetaFields,
        ],
    },

    "Website Development Agreement": {
        key: "Website Development Agreement",
        label: "Website Development Agreement",
        description:
            "Agreement for design, development, and launch of a website or web app.",
        category: "Business / Corporate",
        fields: [
            {
                id: "developerName",
                label: "Developer / Agency Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "clientName",
                label: "Client Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "projectScope",
                label: "Project Scope",
                type: "textarea",
                required: true,
                section: "Scope",
            },
            {
                id: "techStack",
                label: "Technology Stack",
                type: "textarea",
                placeholder: "e.g. React, Next.js, Supabase",
                section: "Scope",
            },
            {
                id: "deliveryTimeline",
                label: "Delivery Timeline",
                type: "textarea",
                required: true,
                section: "Schedule",
            },
            {
                id: "fee",
                label: "Project Fee",
                type: "text",
                required: true,
                section: "Payment",
            },
            {
                id: "maintenanceIncluded",
                label: "Include Post-Launch Maintenance",
                type: "checkbox",
                defaultValue: false,
                section: "Support",
            },
            {
                id: "sourceCodeOwnership",
                label: "Source Code Ownership Terms",
                type: "textarea",
                section: "IP",
            },
            ...commonMetaFields,
        ],
    },

    "Freelancer Agreement": {
        key: "Freelancer Agreement",
        label: "Freelancer Agreement",
        description:
            "Agreement with a freelancer for creative, technical, or project-based work.",
        category: "Business / Corporate",
        fields: [
            {
                id: "freelancerName",
                label: "Freelancer Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "clientName",
                label: "Client Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "projectDescription",
                label: "Project Description",
                type: "textarea",
                required: true,
                section: "Scope",
            },
            {
                id: "feeStructure",
                label: "Fee Structure",
                type: "text",
                placeholder: "e.g. fixed fee, hourly, per milestone",
                required: true,
                section: "Payment",
            },
            {
                id: "revisionRounds",
                label: "Revision Rounds Included",
                type: "text",
                placeholder: "e.g. 2 rounds",
                section: "Delivery",
            },
            {
                id: "deliveryFormat",
                label: "Delivery Format",
                type: "text",
                placeholder: "e.g. Figma, PDF, source files",
                section: "Delivery",
            },
            ...commonMetaFields,
        ],
    },

    "Founders Agreement": {
        key: "Founders Agreement",
        label: "Founders Agreement",
        description:
            "Agreement among startup founders addressing roles, equity, IP, and decision-making.",
        category: "Business / Corporate",
        fields: [
            {
                id: "companyName",
                label: "Startup / Company Name",
                type: "text",
                required: true,
                section: "Company",
            },
            {
                id: "founders",
                label: "Founder Names",
                type: "textarea",
                required: true,
                section: "Founders",
            },
            {
                id: "equitySplit",
                label: "Equity Split",
                type: "textarea",
                required: true,
                section: "Equity",
            },
            {
                id: "rolesResponsibilities",
                label: "Roles and Responsibilities",
                type: "textarea",
                required: true,
                section: "Governance",
            },
            {
                id: "vestingTerms",
                label: "Founder Vesting Terms",
                type: "textarea",
                section: "Equity",
            },
            {
                id: "ipAssignment",
                label: "Intellectual Property Assignment Terms",
                type: "textarea",
                section: "IP",
            },
            {
                id: "departureTerms",
                label: "Founder Departure / Bad Leaver Terms",
                type: "textarea",
                section: "Exit",
            },
            ...commonMetaFields,
        ],
    },

    "Employment NDA": {
        key: "Employment NDA",
        label: "Employment NDA",
        description:
            "Confidentiality agreement tailored for employee access to company information.",
        category: "Employment / HR",
        fields: [
            {
                id: "companyName",
                label: "Company Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "employeeName",
                label: "Employee Name",
                type: "text",
                required: true,
                section: "Parties",
            },
            {
                id: "confidentialMaterials",
                label: "Confidential Materials Covered",
                type: "textarea",
                section: "Confidentiality",
            },
            {
                id: "survivalDuration",
                label: "Confidentiality Duration After Employment",
                type: "text",
                placeholder: "e.g. 3 years",
                section: "Term",
            },
            ...commonMetaFields,
        ],
    },

    "Remote Work Agreement": {
        key: "Remote Work Agreement",
        label: "Remote Work Agreement",
        description:
            "Agreement setting terms for employees or contractors working remotely.",
        category: "Employment / HR",
        fields: [
            {
                id: "companyName",
                label: "Company Name",
                type: "text",
                required: true,
                section: "Organization",
            },
            {
                id: "employeeName",
                label: "Employee Name",
                type: "text",
                required: true,
                section: "Worker",
            },
            {
                id: "workLocation",
                label: "Remote Work Location",
                type: "text",
                required: true,
                section: "Work Arrangement",
            },
            {
                id: "workHours",
                label: "Working Hours / Availability",
                type: "textarea",
                section: "Work Arrangement",
            },
            {
                id: "equipmentProvided",
                label: "Equipment Provided by Company",
                type: "textarea",
                section: "Equipment",
            },
            {
                id: "securityRequirements",
                label: "Security / Data Protection Requirements",
                type: "textarea",
                section: "Compliance",
            },
            ...commonMetaFields,
        ],
    },

    "Return to Work Letter": {
        key: "Return to Work Letter",
        label: "Return to Work Letter",
        description:
            "Letter confirming return to work after leave, suspension, or medical absence.",
        category: "Employment / HR",
        fields: [
            {
                id: "employerName",
                label: "Employer Name",
                type: "text",
                required: true,
                section: "Employer",
            },
            {
                id: "employeeName",
                label: "Employee Name",
                type: "text",
                required: true,
                section: "Employee",
            },
            {
                id: "returnDate",
                label: "Return Date",
                type: "date",
                required: true,
                section: "Return Details",
            },
            {
                id: "conditions",
                label: "Conditions of Return",
                type: "textarea",
                section: "Return Details",
            },
        ],
    },
};

export const DOCUMENT_CATEGORIES: Record<string, string[]> = {
    "Business / Corporate": [
        "NDA (Mutual)",
        "NDA (One-way)",
        "Service Agreement",
        "Master Services Agreement (MSA)",
        "Statement of Work (SOW)",
        "Consulting Agreement",
        "Independent Contractor Agreement",
        "Partnership Agreement",
        "Joint Venture Agreement",
        "Shareholders Agreement",
        "Operating Agreement (LLC)",
        "Subscription / SaaS Agreement",
        "Vendor / Supplier Agreement",
        "Sales Agreement",
        "Website Development Agreement",
        "Freelancer Agreement",
        "Founders Agreement",
    ],
    "Employment / HR": [
        "Employment Offer Letter",
        "Employment Agreement",
        "Non-Compete Agreement",
        "Non-Solicitation Agreement",
        "Employee Handbook Policy",
        "Termination Letter",
        "Intern Agreement",
        "Employment NDA",
        "Remote Work Agreement",
        "Return to Work Letter",
    ],
    "Web / Product / Compliance": [
        "Terms of Service",
        "Privacy Policy",
        "Cookie Policy",
        "EULA (Software License)",
        "Acceptable Use Policy",
        "Data Processing Agreement (DPA)",
        "Refund Policy",
    ],
    "Real Estate": [
        "Lease Agreement (Residential)",
        "Lease Agreement (Commercial)",
        "Rental Addendum",
        "Property Management Agreement",
    ],
    "Finance / Payments": [
        "Loan Agreement",
        "Promissory Note",
        "Payment Terms Addendum",
    ],
};

export const DEFAULT_PARAMS: DocumentField[] = [
    {
        id: "partyA",
        label: "First Party Name",
        type: "text",
        placeholder: "e.g. John Doe",
        required: true,
        section: "Parties",
    },
    {
        id: "partyB",
        label: "Second Party Name",
        type: "text",
        placeholder: "e.g. Acme Corp",
        required: true,
        section: "Parties",
    },
    {
        id: "effectiveDate",
        label: "Effective Date",
        type: "date",
        required: true,
        section: "General",
    },
];

export const DOCUMENT_PARAMS_MAP: Record<string, DocumentField[]> = Object.fromEntries(
    Object.entries(DOCUMENT_DEFINITIONS).map(([key, value]) => [key, value.fields])
);