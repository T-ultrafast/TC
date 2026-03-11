export const DOCUMENT_PARAMS_MAP: Record<string, { id: string, label: string, type: string, placeholder?: string }[]> = {
    // Business / Corporate
    "NDA (Mutual)": [
        { id: "partyA", label: "Party A Name", type: "text", placeholder: "Company A" },
        { id: "partyB", label: "Party B Name", type: "text", placeholder: "Company B" },
        { id: "purpose", label: "Purpose of NDA", type: "text", placeholder: "e.g. Exploring a merger" },
        { id: "duration", label: "Duration", type: "text", placeholder: "e.g. 2 years" },
        { id: "state", label: "Governing State Law", type: "text", placeholder: "e.g. Delaware" }
    ],
    "NDA (One-way)": [
        { id: "disclosingParty", label: "Disclosing Party", type: "text", placeholder: "Company" },
        { id: "receivingParty", label: "Receiving Party", type: "text", placeholder: "Individual/Vendor" },
        { id: "purpose", label: "Purpose of NDA", type: "text", placeholder: "e.g. Service Evaluation" },
        { id: "duration", label: "Duration", type: "text", placeholder: "e.g. 1 year" }
    ],
    "Service Agreement": [
        { id: "serviceProvider", label: "Service Provider Name", type: "text", placeholder: "e.g. Acme Tech" },
        { id: "clientName", label: "Client Name", type: "text", placeholder: "e.g. Globex Corp" },
        { id: "serviceDescription", label: "Description of Services", type: "text" },
        { id: "compensation", label: "Compensation / Fee", type: "text" },
        { id: "startDate", label: "Effective Date", type: "date" }
    ],
    "Master Services Agreement (MSA)": [
        { id: "providerName", label: "Provider Name", type: "text" },
        { id: "clientName", label: "Client Name", type: "text" },
        { id: "paymentTerms", label: "Payment Terms", type: "text", placeholder: "e.g. Net 30" }
    ],
    "Statement of Work (SOW)": [
        { id: "clientName", label: "Client Name", type: "text" },
        { id: "projectName", label: "Project Name", type: "text" },
        { id: "deliverables", label: "Key Deliverables", type: "text" },
        { id: "timeline", label: "Timeline", type: "text" },
        { id: "budget", label: "Budget", type: "text" }
    ],
    "Consulting Agreement": [
        { id: "consultantName", label: "Consultant Name", type: "text" },
        { id: "clientName", label: "Client Name", type: "text" },
        { id: "hourlyRate", label: "Hourly Rate / Fee", type: "text" },
        { id: "scopeOfWork", label: "Scope of Work", type: "text" }
    ],
    "Independent Contractor Agreement": [
        { id: "contractorName", label: "Contractor Name", type: "text" },
        { id: "companyName", label: "Company Name", type: "text" },
        { id: "services", label: "Services Provided", type: "text" },
        { id: "compensation", label: "Compensation", type: "text" }
    ],
    "Partnership Agreement": [
        { id: "partnerA", label: "Partner A Name", type: "text" },
        { id: "partnerB", label: "Partner B Name", type: "text" },
        { id: "businessName", label: "Business Name", type: "text" },
        { id: "profitShare", label: "Profit Share Ratio", type: "text", placeholder: "e.g. 50/50" }
    ],
    "Joint Venture Agreement": [
        { id: "partyA", label: "Party A", type: "text" },
        { id: "partyB", label: "Party B", type: "text" },
        { id: "venturePurpose", label: "Venture Purpose", type: "text" },
        { id: "investment", label: "Capital Investment", type: "text" }
    ],
    "Shareholders Agreement": [
        { id: "companyName", label: "Company Name", type: "text" },
        { id: "shareholders", label: "Shareholder Names", type: "text" },
        { id: "totalShares", label: "Total Shares Authorized", type: "text" }
    ],
    "Operating Agreement (LLC)": [
        { id: "llcName", label: "LLC Name", type: "text" },
        { id: "members", label: "Member Names", type: "text" },
        { id: "managementType", label: "Management Type", type: "text", placeholder: "Member-managed or Manager-managed" }
    ],
    "Subscription / SaaS Agreement": [
        { id: "providerName", label: "SaaS Provider", type: "text" },
        { id: "customerName", label: "Customer Name", type: "text" },
        { id: "subscriptionFee", label: "Subscription Fee", type: "text" },
        { id: "renewalTerm", label: "Renewal Term", type: "text", placeholder: "e.g. Monthly, Annual" }
    ],
    "Vendor / Supplier Agreement": [
        { id: "supplierName", label: "Supplier Name", type: "text" },
        { id: "purchaserName", label: "Purchaser Name", type: "text" },
        { id: "goods", label: "Goods / Products To Supply", type: "text" },
        { id: "pricing", label: "Pricing / Cost", type: "text" }
    ],

    // Employment / HR
    "Employment Offer Letter": [
        { id: "employerName", label: "Employer Name", type: "text", placeholder: "e.g. Acme Corp" },
        { id: "employeeName", label: "Candidate Name", type: "text", placeholder: "e.g. Jane Doe" },
        { id: "jobTitle", label: "Job Title", type: "text", placeholder: "e.g. Senior Developer" },
        { id: "startDate", label: "Start Date", type: "date" },
        { id: "salary", label: "Base Salary / Compensation", type: "text", placeholder: "e.g. $100,000 / year" },
        { id: "managerName", label: "Reporting Manager", type: "text" },
        { id: "benefits", label: "Key Benefits", type: "text", placeholder: "e.g. Health, Vision, 401k" }
    ],
    "Employment Agreement": [
        { id: "employerName", label: "Employer Name", type: "text" },
        { id: "employeeName", label: "Employee Name", type: "text" },
        { id: "jobTitle", label: "Job Title", type: "text" },
        { id: "startDate", label: "Start Date", type: "date" },
        { id: "salary", label: "Salary Amount", type: "text" },
        { id: "employmentType", label: "Employment Type", type: "text", placeholder: "e.g. Full-Time, At-Will" }
    ],
    "Non-Compete Agreement": [
        { id: "employerName", label: "Employer Name", type: "text" },
        { id: "employeeName", label: "Employee Name", type: "text" },
        { id: "duration", label: "Duration After Termination", type: "text", placeholder: "e.g. 1 Year" },
        { id: "territory", label: "Geographic Territory", type: "text", placeholder: "e.g. State of California" }
    ],
    "Non-Solicitation Agreement": [
        { id: "employerName", label: "Employer Name", type: "text" },
        { id: "employeeName", label: "Employee Name", type: "text" },
        { id: "duration", label: "Duration", type: "text", placeholder: "e.g. 2 Years" }
    ],
    "Employee Handbook Policy": [
        { id: "companyName", label: "Company Name", type: "text" },
        { id: "policyTopic", label: "Policy Topic", type: "text", placeholder: "e.g. Remote Work Policy" }
    ],
    "Termination Letter": [
        { id: "employerName", label: "Company Name", type: "text" },
        { id: "employeeName", label: "Employee Name", type: "text" },
        { id: "terminationDate", label: "Effective Date of Termination", type: "date" },
        { id: "reason", label: "Reason (Optional)", type: "text" },
        { id: "severance", label: "Severance Package (if any)", type: "text" }
    ],
    "Intern Agreement": [
        { id: "companyName", label: "Company Name", type: "text" },
        { id: "internName", label: "Intern Name", type: "text" },
        { id: "startDate", label: "Start Date", type: "date" },
        { id: "endDate", label: "End Date", type: "date" },
        { id: "compensation", label: "Compensation (if paid)", type: "text", placeholder: "Leave blank if unpaid" }
    ],

    // Web / Product / Compliance
    "Terms of Service": [
        { id: "companyName", label: "Company Name", type: "text" },
        { id: "websiteName", label: "Website / App Name", type: "text", placeholder: "e.g. MyCoolApp.com" },
        { id: "governingState", label: "Governing Law (State/Country)", type: "text" },
        { id: "contactEmail", label: "Contact Email", type: "text" }
    ],
    "Privacy Policy": [
        { id: "companyName", label: "Company Name", type: "text" },
        { id: "websiteName", label: "Website / App Name", type: "text" },
        { id: "dataCollected", label: "Data Collected", type: "text", placeholder: "e.g. Email, IP, Usage Data" },
        { id: "address", label: "Physical Address", type: "text" },
        { id: "contactEmail", label: "Privacy Contact Email", type: "text" }
    ],
    "Cookie Policy": [
        { id: "companyName", label: "Company Name", type: "text" },
        { id: "websiteName", label: "Website Name", type: "text" },
        { id: "cookieTypes", label: "Types of Cookies Used", type: "text", placeholder: "e.g. Essential, Analytics, Marketing" }
    ],
    "EULA (Software License)": [
        { id: "licensorName", label: "Software Provider / Licensor", type: "text" },
        { id: "appName", label: "Software / App Name", type: "text" },
        { id: "licenseType", label: "License Type", type: "text", placeholder: "e.g. Single User, Non-Commercial" }
    ],
    "Acceptable Use Policy": [
        { id: "companyName", label: "Company Name", type: "text" },
        { id: "serviceName", label: "Service Name", type: "text" },
        { id: "prohibitedActions", label: "Main Prohibited Actions", type: "text", placeholder: "e.g. Spamming, Malware distribution" }
    ],
    "Data Processing Agreement (DPA)": [
        { id: "controllerName", label: "Data Controller", type: "text" },
        { id: "processorName", label: "Data Processor", type: "text" },
        { id: "dataSubjects", label: "Data Subjects", type: "text", placeholder: "e.g. Employees, Customers" },
        { id: "dpaRegion", label: "Governing Law (e.g. GDPR, CCPA)", type: "text" }
    ],
    "Refund Policy": [
        { id: "companyName", label: "Company Name", type: "text" },
        { id: "refundWindow", label: "Refund Window (Days)", type: "text", placeholder: "e.g. 14 Days" },
        { id: "conditions", label: "Refund Conditions", type: "text", placeholder: "e.g. Unopened, Receipt required" },
        { id: "contactEmail", label: "Customer Support Email", type: "text" }
    ],

    // Real Estate
    "Lease Agreement (Residential)": [
        { id: "landlordName", label: "Landlord Name", type: "text" },
        { id: "tenantName", label: "Tenant Name", type: "text" },
        { id: "propertyAddress", label: "Property Address", type: "text" },
        { id: "rentAmount", label: "Monthly Rent", type: "text" },
        { id: "securityDeposit", label: "Security Deposit", type: "text" },
        { id: "leaseTerm", label: "Lease Term", type: "text", placeholder: "e.g. 12 Months" }
    ],
    "Lease Agreement (Commercial)": [
        { id: "landlordName", label: "Landlord Name", type: "text" },
        { id: "businessTenant", label: "Business Tenant Name", type: "text" },
        { id: "propertyAddress", label: "Premises Address", type: "text" },
        { id: "rentAmount", label: "Base Rent", type: "text" },
        { id: "permittedUse", label: "Permitted Business Use", type: "text" }
    ],
    "Rental Addendum": [
        { id: "landlordName", label: "Landlord Name", type: "text" },
        { id: "tenantName", label: "Tenant Name", type: "text" },
        { id: "propertyAddress", label: "Property Address", type: "text" },
        { id: "addendumTopic", label: "Topic (e.g. Pet Policy, Parking)", type: "text" }
    ],
    "Property Management Agreement": [
        { id: "ownerName", label: "Property Owner Name", type: "text" },
        { id: "managerName", label: "Management Company", type: "text" },
        { id: "propertyAddress", label: "Property Address", type: "text" },
        { id: "managementFee", label: "Management Fee", type: "text", placeholder: "e.g. 10% of gross rent" }
    ],

    // Finance / Payments
    "Loan Agreement": [
        { id: "lenderName", label: "Lender Name", type: "text" },
        { id: "borrowerName", label: "Borrower Name", type: "text" },
        { id: "loanAmount", label: "Principal Amount", type: "text" },
        { id: "interestRate", label: "Interest Rate (%)", type: "text" },
        { id: "repaymentDate", label: "Repayment Date", type: "date" }
    ],
    "Promissory Note": [
        { id: "payerName", label: "Maker / Payer Name", type: "text" },
        { id: "payeeName", label: "Payee Name", type: "text" },
        { id: "principal", label: "Principal Amount", type: "text" },
        { id: "maturityDate", label: "Date of Maturity", type: "date" }
    ],
    "Payment Terms Addendum": [
        { id: "partyA", label: "Party A", type: "text" },
        { id: "partyB", label: "Party B", type: "text" },
        { id: "newTerms", label: "New Payment Terms", type: "text", placeholder: "e.g. Net 60 instead of Net 30" }
    ]
};

export const DEFAULT_PARAMS = [
    { id: "partyA", label: "First Party Name", type: "text", placeholder: "e.g. John Doe" },
    { id: "partyB", label: "Second Party Name", type: "text", placeholder: "e.g. Acme Corp" },
    { id: "effectiveDate", label: "Effective Date", type: "date" }
];
