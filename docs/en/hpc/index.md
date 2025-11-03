# HPC Service Description
### Service Overview

- To promote the use of the HPC high-performance computing platform provided by the IT Center among on-campus research teams, we provide a secure and reliable computing service to assist research groups in AI and high-performance computing related research.
- The platform currently has 5 Nvidia DGX servers: two systems equipped with 8 H100 GPUs each, and three systems equipped with 8 H200 GPUs each.
- We offer both exclusive (reserved) and queued (shared) GPU services to meet different research needs and scheduling modes.

### Platform Specifications

| GPU Model | Type | Number of GPU Cores | GPU Memory |
|:---:|:---:|:---:|:---:|
| H100 | whole GPU | | 80GB |
| H200 | whole GPU | 7 | 144GB |
| H200 | MIG-1g.18gb | 1 | 18GB |
| H200 | MIG-2g.35gb | 2 | 35GB |

- Additional services: HPC storage provides 1 TB of free space; beyond 1 TB, the charge is NT$2 per GB.

### Eligible Users

- Faculty and researchers officially appointed by the university may apply; for other affiliations or collaborative projects please contact the IT Center or follow the official announcements.

### How to Apply and Fees

- Please refer to the IT Center's charging standard page for application and fee details.
- New applications should be submitted via the HPC application system (https://hpcreg.nycu.edu.tw/) using the "HPC New Application" feature. Activation is usually completed within 3 working days (accounts may be temporarily activated before the principal investigator's approval). The principal investigator must complete approval within 7 working days; otherwise the account may be suspended and charges may be applied.
- Exclusive GPU service (reserved) is applied per day, with a minimum booking unit of 7 days; multiple units may be booked in one application.

### Billing and Key Usage Rules

- GPU usage is billed post-use. The system sends monthly payment notices; please complete payment by the end of the month. Accounts will be blocked from login if payment is overdue by one week, and accounts and data may be deleted after one month of non-payment.
- Queued (shared) service has a minimum resource usage requirement (for example, a minimum number of GPU hours per month). The system settles monthly and will take follow-up actions if usage does not meet the threshold—please pay attention to official announcements.
- Users must comply with campus information security and intellectual property regulations. In case of serious information security incidents or policy violations, the Center may suspend the account service.
- The platform does not provide backup for user data; users are responsible for backing up important data themselves.

### Usage Notes

- Account access is restricted by IP. According to information security rules, each account may set two allowed IP ranges.
- To encourage research teams, first-time applicants may enjoy a free usage promotional period for the first month (subject to the IT Center's latest announcements).
- For H100, the maximum TimeLimit per job is 7 days; for H200, the maximum TimeLimit per job is 2 days.
- Before submitting jobs, please confirm that your scripts and resource settings (CPU, Memory, GPU, TimeLimit) are correct to avoid jobs being scheduled or cancelled while resources continue to be billed.

### Contact Information

Contact person: Ming-Hong Yen (鄢銘宏), Extension: 31724
Email: hpc@nycu.edu.tw
