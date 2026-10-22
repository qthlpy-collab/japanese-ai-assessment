import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const sections = [
  {
    title: 'Research Design',
    content:
      'The system supports fixed explanations, direct AI correction and AI guided self-correction. Every participant completes independent pre/post tests; a delayed test is scheduled from the submitted post-test time. Condition and form order are recorded. Ten participants are suitable for workflow piloting, not a sufficiently powered three-arm effectiveness claim.'
  },
  {
    title: 'Small Sample Limitation',
    content:
      'Because the planned sample is small, descriptive statistics should be interpreted alongside medians and individual gain scores. The Wilcoxon signed-rank test is treated as the primary inferential analysis.'
  },
  {
    title: 'Why Wilcoxon Was Selected',
    content:
      'Wilcoxon is a paired analysis, with a symmetric distribution of paired differences required for a location-shift interpretation. Zero differences are removed and ties receive average ranks. For at most 20 nonzero pairs this implementation uses exact conditional sign randomization; above 20 it uses a tie-corrected normal approximation without continuity correction. Z-based effect sizes remain approximate.'
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
      'Authored forms follow one blueprint but are not psychometrically equated. Text conversation tasks do not measure speaking or pronunciation. Learning duration is elapsed wall-clock time, not verified active engagement. Small samples, transfer between related items, ceiling effects and self-report bias remain possible. The pooled dashboard does not test between-condition effects. Plan a baseline-adjusted condition contrast and justify sample size by the primary outcome and precision or power before a confirmatory study.'
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
