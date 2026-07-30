<?php

namespace Database\Seeders;

use App\Models\LegalDocument;
use Illuminate\Database\Seeder;

class LegalDocumentSeeder extends Seeder
{
    public function run(): void
    {
        $privacyPolicyContent = <<<'MARKDOWN'
# Privacy Policy

Last Updated: July 30, 2026

## 1. Overview
Welcome to **Aplayan** ("we", "us", "the Service"). Aplayan is an independent AI-powered job application tracking and resume tailoring platform designed to help job seekers organize their career applications efficiently. We respect your privacy and are committed to protecting the personal data you entrust to us.

## 2. Information We Collect
To provide job application tracking and document generation features, we collect the following categories of information:
- **Account Data:** Name, email address, password hash, and Google OAuth profile information when you register or sign in via Google.
- **Career & Application Data:** Resumes, work history, education records, cover letters, contacts, job application titles, salary preferences, and application status logs.
- **Technical & Security Metadata:** IP addresses, browser user-agent data, session tokens, and Cloudflare Turnstile anti-bot verification tokens.

## 3. How We Use & Process Your Data
We utilize your information strictly to operate, maintain, and improve Aplayan services:
- **Job Tracking:** Rendering your Kanban boards, application calendars, and analytics dashboard.
- **Third-Party AI Generation (Google Gemini API):** When you request AI resume matching, cover letter drafting, or salary evaluations, the relevant job description and resume text are sent to the **Google Gemini API** solely to process your request.
- **Security & Authentication:** Preventing bot attacks, authenticating user sessions, and maintaining system integrity via Cloudflare.

## 4. Data Ownership & User Rights
You own your career data. In accordance with core privacy principles (including the Philippine Data Privacy Act of 2012 / RA 10173), you have the right to:
- Access, review, and edit your profile, resumes, and job records at any time.
- Export your job applications as CSV files from your dashboard.
- Delete specific job records, saved resumes, or your entire account data upon request.

## 5. Data Storage & Encryption
Your data is stored on secured cloud infrastructure with encryption in transit (TLS 1.3) and at rest using AES-256. We do not sell, rent, or trade your personal career information to third parties. Your resumes, application records, and profile data remain strictly within the platform and are never shared with recruiters, advertisers, or external data brokers.

## 6. Contact & Support
For inquiries regarding this Privacy Policy or wish to exercise your data privacy rights, please reach out to us at [kenthosila@gmail.com](mailto:kenthosila@gmail.com).
MARKDOWN;

        $termsOfServiceContent = <<<'MARKDOWN'
# Terms of Service

Last Updated: July 30, 2026

## 1. Acceptance of Terms
By accessing or using **Aplayan** ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not access or use the application.

## 2. AI Content Generation & User Responsibility
Aplayan offers AI-assisted features (such as resume matching, cover letter drafting, and salary insight calculations) powered by third-party language models.
- **Verification Required:** AI output is provided for assistance purposes only. You are solely responsible for reviewing, factual checking, and ensuring the accuracy of all resume content, experience descriptions, and emails before sending them to recruiters or employers.
- **No Misrepresentation:** You agree not to use AI generation to create fraudulent career credentials or intentionally mislead potential employers.

## 3. Disclaimer of Warranties & Limitation of Liability
Aplayan is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind.
- **No Guarantee of Employment:** Aplayan is an independent tracking tool. We do not guarantee job callbacks, interview invitations, or employment offers from third-party employers.
- **Third-Party Dependencies:** We are not liable for temporary service interruptions caused by third-party providers (such as Google Gemini, Cloudflare, or hosting infrastructure).
- **Limitation of Liability:** To the maximum extent permitted by applicable law, the independent developer of Aplayan shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.

## 4. Account Termination & Acceptable Use
We reserve the right to suspend or terminate account access if a user engages in abusive behavior, attempts to breach system security, or violates these Terms of Service.

## 5. Questions & Support
For inquiries regarding these Terms of Service, please contact us at [kenthosila@gmail.com](mailto:kenthosila@gmail.com).
MARKDOWN;

        LegalDocument::updateOrCreate(
            ['key' => 'privacy-policy'],
            [
                'title' => 'Privacy Policy',
                'content' => $privacyPolicyContent,
                'version' => 1,
            ]
        );

        LegalDocument::updateOrCreate(
            ['key' => 'terms-of-service'],
            [
                'title' => 'Terms of Service',
                'content' => $termsOfServiceContent,
                'version' => 1,
            ]
        );

        if ($this->command) {
            $this->command->info('✓ Seeded Privacy Policy and Terms of Service successfully.');
        }
    }
}
