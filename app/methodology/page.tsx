import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const sections = [
  {
    title: 'Research Design',
    content:
      'The system supports a single-group pre-test, AI-assisted learning session, immediate post-test, delayed post-test, and learner questionnaire design. The intended sample size is approximately ten Chinese-background Japanese learners.'
  },
  {
    title: 'Small Sample Limitation',
    content:
      'Because the planned sample is small, descriptive statistics should be interpreted alongside medians and individual gain scores. The Wilcoxon signed-rank test is treated as the primary inferential analysis.'
  },
  {
    title: 'Why Wilcoxon Was Selected',
    content:
      'The Wilcoxon signed-rank test is appropriate for paired pre/post comparisons when normality cannot be assumed. This implementation uses a normal approximation, removes zero differences, and uses average ranks for tied absolute differences.'
  },
  {
    title: 'Effect Size',
    content:
      'Effect size is calculated as r = |Z| / sqrt(N). Interpretations are negligible (<0.10), small (0.10-0.29), medium (0.30-0.49), and large (0.50 or above). Effects should not be judged by p-values alone.'
  },
  {
    title: 'Immediate Learning vs Retention',
    content:
      'Immediate post-test gains may reflect short-term learning or test familiarity. Retention is estimated by delayed post-test score divided by immediate post-test score. A decrease from post to delayed suggests possible retention loss.'
  },
  {
    title: 'Multiple Comparisons',
    content:
      'The app displays raw p-values and Holm-adjusted p-values because several dimensions are tested simultaneously. Holm correction is shown for transparency but should be reported with methodological caution.'
  },
  {
    title: 'Response Time',
    content:
      'Response time is measured in seconds. Reduced response time can suggest faster retrieval, but reduced response time does not necessarily indicate improved language quality.'
  },
  {
    title: 'Questionnaire Analysis',
    content:
      'Single Likert items are summarized using median, interquartile range, frequency distribution, and percentage selecting 4 or 5. The app avoids complex inferential claims for individual Likert items.'
  },
  {
    title: 'Limitations',
    content:
      'The round-one dataset is small. A two-hour intervention is short, there is no control group, test familiarity may influence gains, ceiling effects may affect high-level learners, and self-report questionnaire responses may contain bias.'
  }
];

export default function MethodologyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Methodology</h2>
        <p className="mt-2 text-[var(--muted-foreground)]">Transparent statistical and research-design notes for MP6 presentation and reporting.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-[var(--muted-foreground)]">{section.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-[#f1b8bf] bg-[#fff3f4]">
        <CardHeader>
          <CardTitle>Prohibited Interpretation</CardTitle>
          <CardDescription>
            Avoid expressions such as “proves that AI works,” “confirms that AI causes improvement,” “demonstrates
            long-term effectiveness,” or “statistically significant therefore educationally important.”
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
