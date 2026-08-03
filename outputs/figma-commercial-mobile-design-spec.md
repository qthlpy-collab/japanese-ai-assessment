# Figma Design Spec: AI Japanese Assessment App

## Product Positioning

Product name: **Nihongo AI Assess**

Positioning: A commercial mobile assessment app for Chinese learners of Japanese, designed for universities, language schools, and large student cohorts.

Core value:

- Task-based Japanese proficiency assessment
- AI-powered feedback and diagnostic reports
- Academic Japanese and daily-life Japanese tracks
- Class-level student progress monitoring
- APK-ready mobile product structure

Target users:

- Student: takes assessments, receives AI feedback, practices weak skills
- Teacher: monitors class performance and frequent error patterns
- School administrator: manages cohorts, classes, and reports

## Design Direction

Style keywords:

- Commercial education software
- Clean, trustworthy, scalable
- University-grade but mobile-friendly
- Data-rich without feeling crowded
- Japanese learning identity without cute game styling

Visual tone:

- Background: soft neutral gray
- Primary color: deep academic green
- Accent color: warm vermilion
- Success color: teal
- Warning color: amber
- Error color: rose

Recommended color tokens:

```text
Primary / Deep Green: #173B2F
Primary Light: #E8F1ED
Accent / Vermilion: #C94C32
Background: #F6F8F7
Surface: #FFFFFF
Border: #DDE5E1
Text Primary: #17201B
Text Secondary: #5E6A63
Success: #168A75
Warning: #D98C18
Risk High: #C73A4A
```

Typography:

```text
English UI: Inter / SF Pro / Roboto
Japanese text: Noto Sans JP
Chinese explanation: Noto Sans SC
```

Mobile frame:

```text
Figma frame size: 390 x 844
Grid: 4 columns
Margin: 20
Gutter: 12
Card radius: 12
Button radius: 10
Bottom navigation height: 72
```

## Information Architecture

Main tabs:

1. Home
2. Assessment
3. Report
4. Practice
5. Profile

Teacher/admin web or tablet extension:

1. Class dashboard
2. Student list
3. Error distribution
4. Export reports
5. Task library

## Core Mobile Screens

### Screen 1: Splash / Brand

Purpose: Build product identity.

Elements:

- App logo mark
- Product name: Nihongo AI Assess
- Tagline: AI-based Japanese proficiency assessment for Chinese learners
- Loading status

Figma notes:

- Use full-screen primary green background
- White logo and text
- Keep it professional, not playful

### Screen 2: Login

Purpose: Commercial app entry for large schools.

Elements:

- School / Organization ID field
- Email / Student ID field
- Password field
- Login button
- SSO option: Sign in with school account
- Language switch: EN / 中文 / 日本語

Commercial detail:

- Include privacy and data security link
- Include "Teacher/Admin Login" text link

### Screen 3: Student Home Dashboard

Purpose: Give students a clear next action.

Top area:

- Greeting: Good afternoon, Li Ming
- JLPT target or course: N2 Academic Track
- Current proficiency estimate: 72 / 100

Main CTA:

- Continue Assessment
- Start New Diagnostic Test

Cards:

- Academic Japanese: 76
- Daily Life Japanese: 63
- Keigo Control: Needs practice
- Particle Accuracy: Medium risk

Bottom nav:

- Home
- Assessment
- Report
- Practice
- Profile

### Screen 4: Track Selection

Purpose: Choose between the two task tracks.

Cards:

- Academic Japanese Assessment
  - Research explanation
  - Formal email
  - Academic summary
- Daily Life Japanese Assessment
  - Hospital
  - Housing
  - Part-time job interview

Commercial detail:

- Add estimated time: 8-12 min
- Add completion status
- Add recommended badge based on weak skill

### Screen 5: Assessment Task

Purpose: Student writes or speaks an answer.

Elements:

- Progress: Task 2 of 6
- Scenario card
- Task instruction
- Hint chips: 研究 / 目的 / 方法 / 課題 / 分析
- Text input
- Optional voice recording button
- Submit for AI Evaluation

APK-ready detail:

- Mobile keyboard-safe layout
- Save draft automatically
- Allow voice input in future Android version

### Screen 6: AI Feedback

Purpose: Show immediate evaluation.

Top:

- Overall score: 82
- Risk badge: Medium Chinese transfer risk

Score dimensions:

- Task Completion
- Grammar Accuracy
- Vocabulary Appropriateness
- Politeness / Keigo
- Fluency / Completeness

Feedback sections:

- Strengths
- Weaknesses
- Error Types
- Suggested Improvement
- Improved Japanese Sample Answer
- Chinese Explanation

Commercial detail:

- Keep feedback structured and scannable
- Use "Save to Report" and "Practice This Weakness" buttons

### Screen 7: Diagnostic Report

Purpose: Show full student profile.

Elements:

- Total score
- Academic Japanese score
- Daily Life Japanese score
- Radar chart or bar chart
- Strongest skill
- Weakest skill
- Frequent error types
- Chinese learner-specific diagnosis

Report text example:

```text
The learner shows relative strength in kanji-based academic vocabulary,
but needs improvement in keigo control, particle accuracy, and natural
daily-life task completion.
```

### Screen 8: Personalized Practice

Purpose: Convert diagnosis into learning.

Exercise cards:

- Particle practice
- Keigo rewriting
- Kanji transfer comparison
- Academic email template
- Hospital conversation
- Housing inquiry dialogue

Commercial detail:

- Show difficulty level
- Show estimated time
- Show progress streak

### Screen 9: Class / Teacher Dashboard

Purpose: Make the product useful for many students.

Elements:

- Class average score
- Completion rate
- Academic vs daily-life comparison
- Most frequent error types
- At-risk students
- Export CSV / PDF report

This screen can be a tablet/web frame in Figma:

```text
Frame size: 1440 x 1024
```

### Screen 10: Student Profile

Purpose: Support real app account flow.

Elements:

- Name
- School
- Class
- Target level
- Assessment history
- Certificates / exported reports
- Settings
- Privacy policy
- Logout

## Component Library

Create these Figma components:

- Primary button
- Secondary button
- Icon button
- Text input
- Password input
- Language switch
- Track card
- Task card
- Score card
- Risk badge
- Feedback section
- Progress bar
- Bottom nav item
- Report chart bar
- Practice exercise card
- Teacher dashboard metric card
- Empty state
- Loading state
- Error state

## APK Product Requirements

For APK-ready planning, design should consider:

- Login and account identity
- Student data privacy
- Network error state
- Offline draft saving
- Mobile keyboard behavior
- Android back button behavior
- Loading and retry states for AI evaluation
- Clear permission rationale if voice recording is added
- Privacy policy and terms page
- App icon and splash screen
- Tablet layout for teachers

Recommended Android tech path:

1. Keep current React product as the web version
2. Convert to mobile app with Capacitor
3. Add Android build through Android Studio
4. Package as APK/AAB
5. Prepare store assets: icon, screenshots, privacy policy, description

## Figma Page Structure

Recommended Figma pages:

```text
00 Cover
01 Design System
02 Mobile Student App
03 AI Feedback Flow
04 Teacher Dashboard
05 APK Store Assets
06 Prototype Links
```

## Prototype Flow

Set these Figma prototype connections:

```text
Splash -> Login
Login -> Student Home
Student Home -> Track Selection
Track Selection -> Assessment Task
Assessment Task -> AI Feedback
AI Feedback -> Diagnostic Report
Diagnostic Report -> Personalized Practice
Bottom nav -> Home / Assessment / Report / Practice / Profile
Teacher Login -> Teacher Dashboard
```

## App Store / APK Screenshot Set

Create these 5 promotional screenshots:

1. AI Japanese assessment for Chinese learners
2. Academic and daily-life task tracks
3. Instant AI feedback with score dimensions
4. Diagnostic report and weakness analysis
5. Personalized practice plan for improvement

