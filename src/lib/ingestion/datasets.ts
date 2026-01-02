import type { CorpusSource, RawDocument } from './types';

// Built-in mock legal texts for each corpus source
export const CORPUS_DATASETS: Record<CorpusSource, RawDocument[]> = {
  'us-code': [
    {
      id: 'usc-42-3604',
      title: 'Fair Housing Act - Discrimination in Sale or Rental',
      citation: '42 U.S.C. § 3604',
      jurisdiction: 'federal',
      authorityLevel: 'statute',
      effectiveFrom: '1968-04-11',
      rawText: `SEC. 804. [42 U.S.C. 3604] DISCRIMINATION IN SALE OR RENTAL OF HOUSING

As made applicable by section 803 of this title and except as exempted by sections 803(b) and 807 of this title, it shall be unlawful—

(a) To refuse to sell or rent after the making of a bona fide offer, or to refuse to negotiate for the sale or rental of, or otherwise make unavailable or deny, a dwelling to any person because of race, color, religion, sex, familial status, or national origin.

(b) To discriminate against any person in the terms, conditions, or privileges of sale or rental of a dwelling, or in the provision of services or facilities in connection therewith, because of race, color, religion, sex, familial status, or national origin.

(c) To make, print, or publish, or cause to be made, printed, or published any notice, statement, or advertisement, with respect to the sale or rental of a dwelling that indicates any preference, limitation, or discrimination based on race, color, religion, sex, handicap, familial status, or national origin, or an intention to make any such preference, limitation, or discrimination.`,
      sections: [
        {
          id: 'usc-42-3604-a',
          heading: 'Prohibition of Discriminatory Practices',
          citation: '42 U.S.C. § 3604(a)',
          text: 'To refuse to sell or rent after the making of a bona fide offer, or to refuse to negotiate for the sale or rental of, or otherwise make unavailable or deny, a dwelling to any person because of race, color, religion, sex, familial status, or national origin.',
        },
        {
          id: 'usc-42-3604-b',
          heading: 'Terms and Conditions',
          citation: '42 U.S.C. § 3604(b)',
          text: 'To discriminate against any person in the terms, conditions, or privileges of sale or rental of a dwelling, or in the provision of services or facilities in connection therewith, because of race, color, religion, sex, familial status, or national origin.',
        },
      ],
    },
    {
      id: 'usc-42-1983',
      title: 'Civil Rights Act - Civil Action for Deprivation of Rights',
      citation: '42 U.S.C. § 1983',
      jurisdiction: 'federal',
      authorityLevel: 'statute',
      effectiveFrom: '1871-04-20',
      rawText: `SEC. 1983. CIVIL ACTION FOR DEPRIVATION OF RIGHTS

Every person who, under color of any statute, ordinance, regulation, custom, or usage, of any State or Territory or the District of Columbia, subjects, or causes to be subjected, any citizen of the United States or other person within the jurisdiction thereof to the deprivation of any rights, privileges, or immunities secured by the Constitution and laws, shall be liable to the party injured in an action at law, suit in equity, or other proper proceeding for redress, except that in any action brought against a judicial officer for an act or omission taken in such officer's judicial capacity, injunctive relief shall not be granted unless a declaratory decree was violated or declaratory relief was unavailable.`,
      sections: [
        {
          id: 'usc-42-1983-1',
          heading: 'Civil Action for Deprivation of Rights',
          citation: '42 U.S.C. § 1983',
          text: 'Every person who, under color of any statute, ordinance, regulation, custom, or usage, of any State or Territory or the District of Columbia, subjects, or causes to be subjected, any citizen of the United States or other person within the jurisdiction thereof to the deprivation of any rights, privileges, or immunities secured by the Constitution and laws, shall be liable to the party injured.',
        },
      ],
    },
    {
      id: 'usc-5-552',
      title: 'Freedom of Information Act',
      citation: '5 U.S.C. § 552',
      jurisdiction: 'federal',
      authorityLevel: 'statute',
      effectiveFrom: '1966-07-04',
      rawText: `SEC. 552. PUBLIC INFORMATION; AGENCY RULES, OPINIONS, ORDERS, RECORDS, AND PROCEEDINGS

(a) Each agency shall make available to the public information as follows:

(1) Each agency shall separately state and currently publish in the Federal Register for the guidance of the public—
(A) descriptions of its central and field organization and the established places at which, the employees from whom, and the methods whereby, the public may obtain information, make submittals or requests, or obtain decisions;
(B) statements of the general course and method by which its functions are channeled and determined.

(2) Each agency, in accordance with published rules, shall make available for public inspection in an electronic format—
(A) final opinions, including concurring and dissenting opinions, as well as orders, made in the adjudication of cases;
(B) those statements of policy and interpretations which have been adopted by the agency and are not published in the Federal Register.`,
      sections: [
        {
          id: 'usc-5-552-a1',
          heading: 'Publication Requirements',
          citation: '5 U.S.C. § 552(a)(1)',
          text: 'Each agency shall separately state and currently publish in the Federal Register for the guidance of the public descriptions of its central and field organization and the established places at which the public may obtain information.',
        },
        {
          id: 'usc-5-552-a2',
          heading: 'Public Inspection',
          citation: '5 U.S.C. § 552(a)(2)',
          text: 'Each agency, in accordance with published rules, shall make available for public inspection in an electronic format final opinions, including concurring and dissenting opinions, as well as orders, made in the adjudication of cases.',
        },
      ],
    },
  ],

  ecfr: [
    {
      id: 'cfr-24-100',
      title: 'Fair Housing - General',
      citation: '24 C.F.R. § 100',
      jurisdiction: 'federal',
      authorityLevel: 'regulation',
      effectiveFrom: '2023-01-01',
      rawText: `PART 100—DISCRIMINATORY CONDUCT UNDER THE FAIR HOUSING ACT

Subpart A—General

§ 100.1 Authority.
This part is issued under the authority of the Secretary of Housing and Urban Development to administer and enforce title VIII of the Civil Rights Act of 1968, as amended by the Fair Housing Amendments Act of 1988 (the Fair Housing Act).

§ 100.5 Scope.
(a) It is the policy of the United States to provide, within constitutional limitations, for fair housing throughout the United States.
(b) This part provides the Department's interpretation of the coverage of the Fair Housing Act regarding discrimination related to the sale or rental of dwellings.

§ 100.10 Definitions.
As used in this part:
Aggrieved person includes any person who claims to have been injured by a discriminatory housing practice or believes that such person will be injured by a discriminatory housing practice.`,
      sections: [
        {
          id: 'cfr-24-100-1',
          heading: 'Authority',
          citation: '24 C.F.R. § 100.1',
          text: 'This part is issued under the authority of the Secretary of Housing and Urban Development to administer and enforce title VIII of the Civil Rights Act of 1968, as amended by the Fair Housing Amendments Act of 1988.',
        },
        {
          id: 'cfr-24-100-5',
          heading: 'Scope',
          citation: '24 C.F.R. § 100.5',
          text: 'It is the policy of the United States to provide, within constitutional limitations, for fair housing throughout the United States. This part provides the Department\'s interpretation of the coverage of the Fair Housing Act.',
        },
      ],
    },
    {
      id: 'cfr-40-50',
      title: 'EPA - Protection of Environment',
      citation: '40 C.F.R. § 50',
      jurisdiction: 'federal',
      authorityLevel: 'regulation',
      effectiveFrom: '2023-06-15',
      rawText: `PART 50—NATIONAL PRIMARY AND SECONDARY AMBIENT AIR QUALITY STANDARDS

§ 50.1 Definitions.
(a) As used in this part, all terms not defined herein shall have the meaning given them by the Act.
(b) Act means the Clean Air Act, as amended (42 U.S.C. 7401 et seq.).
(c) Agency means the Environmental Protection Agency.

§ 50.2 Scope.
(a) National primary and secondary ambient air quality standards under section 109 of the Act are set forth in this part.
(b) National primary ambient air quality standards define levels of air quality which the Administrator judges are necessary, with an adequate margin of safety, to protect the public health.

§ 50.4 National primary ambient air quality standards for sulfur oxides.
The national primary ambient air quality standard for sulfur oxides measured as sulfur dioxide is 75 parts per billion (ppb), 1-hour average concentration.`,
      sections: [
        {
          id: 'cfr-40-50-1',
          heading: 'Definitions',
          citation: '40 C.F.R. § 50.1',
          text: 'As used in this part, Act means the Clean Air Act, as amended. Agency means the Environmental Protection Agency.',
        },
        {
          id: 'cfr-40-50-2',
          heading: 'Scope',
          citation: '40 C.F.R. § 50.2',
          text: 'National primary and secondary ambient air quality standards under section 109 of the Act are set forth in this part. National primary ambient air quality standards define levels of air quality necessary to protect public health.',
        },
      ],
    },
  ],

  'texas-statutes': [
    {
      id: 'tex-prop-5-001',
      title: 'Texas Property Code - Property Rights',
      citation: 'Tex. Prop. Code § 5.001',
      jurisdiction: 'state',
      authorityLevel: 'statute',
      effectiveFrom: '2023-09-01',
      rawText: `PROPERTY CODE
TITLE 2. CONVEYANCES
CHAPTER 5. PROPERTY RIGHTS

Sec. 5.001. FEE SIMPLE. An estate in land that is conveyed or devised is a fee simple unless the estate is limited by express words or unless a lesser estate is conveyed or devised by construction or operation of law.

Sec. 5.002. PROPERTY OWNER RIGHTS. A property owner has the right to the unrestricted use of the owner's property, subject only to:
(1) restrictions agreed to by the owner in writing;
(2) restrictions imposed by law; and
(3) valid restrictive covenants of record.

Sec. 5.003. LIMITATIONS ON MUNICIPAL AUTHORITY. A municipality may not adopt or enforce an ordinance that:
(1) prohibits a property owner from renting the owner's property; or
(2) requires a property owner to occupy the owner's property as a condition of renting the property to others, except as specifically authorized by state law.`,
      sections: [
        {
          id: 'tex-prop-5-001',
          heading: 'Fee Simple',
          citation: 'Tex. Prop. Code § 5.001',
          text: 'An estate in land that is conveyed or devised is a fee simple unless the estate is limited by express words or unless a lesser estate is conveyed or devised by construction or operation of law.',
        },
        {
          id: 'tex-prop-5-002',
          heading: 'Property Owner Rights',
          citation: 'Tex. Prop. Code § 5.002',
          text: 'A property owner has the right to the unrestricted use of the owner\'s property, subject only to restrictions agreed to by the owner in writing, restrictions imposed by law, and valid restrictive covenants of record.',
        },
        {
          id: 'tex-prop-5-003',
          heading: 'Limitations on Municipal Authority',
          citation: 'Tex. Prop. Code § 5.003',
          text: 'A municipality may not adopt or enforce an ordinance that prohibits a property owner from renting the owner\'s property or requires a property owner to occupy the owner\'s property as a condition of renting.',
        },
      ],
    },
    {
      id: 'tex-loc-gov-51-001',
      title: 'Texas Local Government Code - Municipal Powers',
      citation: "Tex. Loc. Gov't Code § 51.001",
      jurisdiction: 'state',
      authorityLevel: 'statute',
      effectiveFrom: '2023-09-01',
      rawText: `LOCAL GOVERNMENT CODE
TITLE 3. ORGANIZATION OF COUNTY GOVERNMENT
SUBTITLE A. ORGANIZATION OF MUNICIPALITIES
CHAPTER 51. GENERAL POWERS OF MUNICIPALITIES

Sec. 51.001. PURPOSE. The purpose of this chapter is to establish the general powers of municipalities.

Sec. 51.012. GENERAL POWERS. (a) A municipality may adopt an ordinance, act, law, or regulation, not inconsistent with state law, that is for the good government, peace, and order of the municipality.
(b) A municipality may provide for the safety, preserve the health, promote the prosperity, and improve the morals, order, comfort, and convenience of the municipality and the inhabitants of the municipality.

Sec. 51.072. POLICE POWERS. (a) The governing body of a municipality may adopt an ordinance to govern any matter authorized by law that is related to the health, safety, or welfare of the municipality and its inhabitants.
(b) The exercise of police powers must be reasonable and not in conflict with state or federal law.`,
      sections: [
        {
          id: 'tex-loc-gov-51-001',
          heading: 'Purpose',
          citation: "Tex. Loc. Gov't Code § 51.001",
          text: 'The purpose of this chapter is to establish the general powers of municipalities.',
        },
        {
          id: 'tex-loc-gov-51-012',
          heading: 'General Powers',
          citation: "Tex. Loc. Gov't Code § 51.012",
          text: 'A municipality may adopt an ordinance, act, law, or regulation, not inconsistent with state law, that is for the good government, peace, and order of the municipality.',
        },
        {
          id: 'tex-loc-gov-51-072',
          heading: 'Police Powers',
          citation: "Tex. Loc. Gov't Code § 51.072",
          text: 'The governing body of a municipality may adopt an ordinance to govern any matter authorized by law that is related to the health, safety, or welfare of the municipality and its inhabitants.',
        },
      ],
    },
  ],

  'austin-ordinances': [
    {
      id: 'austin-25-2-788',
      title: 'Austin Short-Term Rental Ordinance',
      citation: 'Austin Code § 25-2-788',
      jurisdiction: 'municipal',
      authorityLevel: 'ordinance',
      effectiveFrom: '2022-01-01',
      rawText: `AUSTIN CITY CODE
TITLE 25. LAND DEVELOPMENT
CHAPTER 25-2. ZONING
ARTICLE 6. USE REGULATIONS
DIVISION 5. SHORT-TERM RENTALS

§ 25-2-788. SHORT-TERM RENTAL REGISTRATION.

(A) A person may not operate a short-term rental in the City without a valid short-term rental license issued by the Director.

(B) To be eligible for a short-term rental license, the applicant must demonstrate that:
(1) The property meets all applicable building, fire, and health codes;
(2) The owner or a designated operator resides on the property;
(3) The property is not subject to any outstanding code violations.

(C) A short-term rental license must be renewed annually and is non-transferable.

(D) The Director may revoke a license for violation of this section or any applicable code.

Note: This owner-occupancy requirement may be subject to legal challenge under Texas Property Code § 5.003.`,
      sections: [
        {
          id: 'austin-25-2-788-a',
          heading: 'License Required',
          citation: 'Austin Code § 25-2-788(A)',
          text: 'A person may not operate a short-term rental in the City without a valid short-term rental license issued by the Director.',
        },
        {
          id: 'austin-25-2-788-b',
          heading: 'Eligibility Requirements',
          citation: 'Austin Code § 25-2-788(B)',
          text: 'To be eligible for a short-term rental license, the applicant must demonstrate that the property meets all applicable codes, the owner or designated operator resides on the property, and no outstanding code violations exist.',
        },
        {
          id: 'austin-25-2-788-c',
          heading: 'Renewal',
          citation: 'Austin Code § 25-2-788(C)',
          text: 'A short-term rental license must be renewed annually and is non-transferable.',
        },
      ],
    },
    {
      id: 'austin-25-2-zoning',
      title: 'Austin Zoning Regulations',
      citation: 'Austin Code § 25-2',
      jurisdiction: 'municipal',
      authorityLevel: 'ordinance',
      effectiveFrom: '2020-06-01',
      rawText: `AUSTIN CITY CODE
TITLE 25. LAND DEVELOPMENT
CHAPTER 25-2. ZONING

§ 25-2-1. PURPOSE AND INTENT.
The purpose of this chapter is to implement the City's comprehensive plan by establishing zoning districts and regulating land use within the City.

§ 25-2-2. GENERAL PROVISIONS.
(A) All land within the corporate limits of the City is subject to the provisions of this chapter.
(B) No land shall be used except in conformity with the applicable provisions of this chapter.

§ 25-2-3. ZONING DISTRICTS ESTABLISHED.
The following base zoning districts are established:
(1) Residential districts (SF-1 through SF-6, MF-1 through MF-6);
(2) Commercial districts (LO, GO, CR, CS, CH, CBD);
(3) Industrial districts (LI, MI, HI);
(4) Special purpose districts (P, PUD, TOD).`,
      sections: [
        {
          id: 'austin-25-2-1',
          heading: 'Purpose and Intent',
          citation: 'Austin Code § 25-2-1',
          text: 'The purpose of this chapter is to implement the City\'s comprehensive plan by establishing zoning districts and regulating land use within the City.',
        },
        {
          id: 'austin-25-2-2',
          heading: 'General Provisions',
          citation: 'Austin Code § 25-2-2',
          text: 'All land within the corporate limits of the City is subject to the provisions of this chapter. No land shall be used except in conformity with the applicable provisions of this chapter.',
        },
      ],
    },
    {
      id: 'austin-env-1',
      title: 'Austin Environmental Regulations',
      citation: 'Austin Code § 25-8',
      jurisdiction: 'municipal',
      authorityLevel: 'ordinance',
      effectiveFrom: '2021-03-15',
      rawText: `AUSTIN CITY CODE
TITLE 25. LAND DEVELOPMENT
CHAPTER 25-8. ENVIRONMENT

§ 25-8-1. PURPOSE.
The purpose of this chapter is to protect the environmental quality of the City by establishing requirements for development that may impact natural resources.

§ 25-8-21. WATER QUALITY STANDARDS.
(A) All development shall comply with the water quality requirements established by this section.
(B) Development shall not cause or contribute to a violation of applicable water quality standards.
(C) The City may impose additional requirements beyond federal and state minimums where necessary to protect local water resources.

Note: Additional requirements beyond federal EPA standards may face preemption challenges.`,
      sections: [
        {
          id: 'austin-25-8-1',
          heading: 'Purpose',
          citation: 'Austin Code § 25-8-1',
          text: 'The purpose of this chapter is to protect the environmental quality of the City by establishing requirements for development that may impact natural resources.',
        },
        {
          id: 'austin-25-8-21',
          heading: 'Water Quality Standards',
          citation: 'Austin Code § 25-8-21',
          text: 'All development shall comply with water quality requirements. The City may impose additional requirements beyond federal and state minimums where necessary to protect local water resources.',
        },
      ],
    },
  ],
};
