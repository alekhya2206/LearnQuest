// ─────────────────────────────────────────────
//  LearnQuest — Hard-coded data (demo mode)
// ─────────────────────────────────────────────

export const DEMO_USER = {
  name: 'Alex Chen',
  email: 'alex@learnquest.ai',
  level: 7,
  xp: 2450,
  streak: 7,
  badges: ['First Quest', 'On Fire', 'Hidden Hunter'],
};


// ML Roadmap Nodes - Beginner (1-10)
export const ML_ROADMAP_BEGINNER = [
  { id:1, level:1, title:'What is Machine Learning?', xp:100, time:'45 min', x:180, y:80 },
  { id:2, level:2, title:'Python for ML Basics', xp:150, time:'2 hrs', x:340, y:160 },
  { id:3, level:3, title:'NumPy & Data Manipulation', xp:200, time:'2 hrs', x:200, y:260 },
  { id:4, level:4, title:'Linear Algebra Foundations', xp:250, time:'3 hrs', x:400, y:340 },
  { id:5, level:5, title:'Supervised Learning', xp:300, time:'3 hrs', x:600, y:240, isMajor: true, img: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=200&h=200' },
  { id:6, level:6, title:'Regression Models', xp:300, time:'2.5 hrs', x:750, y:140 },
  { id:7, level:7, title:'Classification Algorithms', xp:350, time:'3 hrs', x:820, y:300 },
  { id:'H1', level:'?', title:'Hidden Quest: The Bias-Variance Oracle', xp:500, time:'???', x:580, y:420 },
  { id:8, level:8, title:'Decision Trees', xp:400, time:'3 hrs', x:960, y:200 },
  { id:9, level:9, title:'Model Evaluation', xp:350, time:'2 hrs', x:1150, y:160 },
  { id:10, level:10, title:'Unsupervised Learning', xp:450, time:'4 hrs', x:1100, y:360 },
];

export const ML_CONNECTIONS_BEGINNER = [
  [1,2],[2,3],[3,4],[4,5],[5,6],[5,7],[5,'H1'],
  [6,8],[7,8],[8,9],[9,10]
];

// ML Roadmap Nodes - Intermediate (11-20)
export const ML_ROADMAP_INTERMEDIATE = [
  { id:11, level:11, title:'Feature Engineering', xp:400, time:'3 hrs', x:180, y:120 },
  { id:12, level:12, title:'Advanced SVMs', xp:450, time:'4 hrs', x:360, y:240 },
  { id:13, level:13, title:'Neural Networks Intro', xp:500, time:'4 hrs', x:600, y:200, isMajor: true, img: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=200&h=200' },
  { id:14, level:14, title:'Deep Learning Foundations', xp:550, time:'5 hrs', x:780, y:100 },
  { id:15, level:15, title:'Gradient Descent & Backprop', xp:600, time:'4 hrs', x:850, y:320 },
  { id:'H2', level:'?', title:'Hidden Quest: The Optimization Enigma', xp:700, time:'???', x:700, y:450 },
  { id:16, level:16, title:'Convolutional Neural Networks', xp:650, time:'5 hrs', x:1050, y:200 },
  { id:17, level:17, title:'Recurrent Neural Networks', xp:650, time:'5 hrs', x:1200, y:100 },
  { id:18, level:18, title:'NLP Basics', xp:550, time:'4 hrs', x:1350, y:300 },
  { id:19, level:19, title:'Recommender Systems', xp:600, time:'4 hrs', x:1450, y:140 },
  { id:20, level:20, title:'Time Series Forecasting', xp:650, time:'5 hrs', x:1550, y:400 }
];

export const ML_CONNECTIONS_INTERMEDIATE = [
  [11,12],[12,13],[13,14],[13,15],[13,'H2'],
  [14,16],[15,16],[16,17],[16,18],[17,19],[18,20],[19,20]
];

// ML Roadmap Nodes - Advanced (21-30)
export const ML_ROADMAP_ADVANCED = [
  { id:21, level:21, title:'Transformer Architectures', xp:800, time:'6 hrs', x:200, y:250, isMajor: true, img: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=200&h=200' },
  { id:22, level:22, title:'Attention Mechanisms', xp:700, time:'5 hrs', x:400, y:150 },
  { id:23, level:23, title:'Large Language Models (LLMs)', xp:850, time:'7 hrs', x:600, y:250 },
  { id:24, level:24, title:'Reinforcement Learning', xp:900, time:'8 hrs', x:800, y:120 },
  { id:25, level:25, title:'GANs & Generative AI', xp:850, time:'6 hrs', x:850, y:380 },
  { id:26, level:26, title:'RLHF (Human Feedback)', xp:750, time:'5 hrs', x:1050, y:250 },
  { id:27, level:27, title:'Model Deployment & MLOps', xp:700, time:'4 hrs', x:1200, y:100 },
  { id:28, level:28, title:'Distributed Training', xp:800, time:'6 hrs', x:1350, y:350 },
  { id:'H3', level:'?', title:'Hidden Quest: The AGI Protocol', xp:1000, time:'???', x:1250, y:500 },
  { id:29, level:29, title:'AI Safety & Alignment', xp:750, time:'5 hrs', x:1500, y:150 },
  { id:30, level:30, title:'State of the Art Frontiers', xp:1000, time:'10 hrs', x:1650, y:300 }
];

export const ML_CONNECTIONS_ADVANCED = [
  [21,22],[21,23],[22,23],[23,24],[23,25],
  [24,26],[25,26],[26,27],[26,28],[28,'H3'],
  [27,29],[28,30],[29,30]
];

export const ML_ROADMAP = [...ML_ROADMAP_BEGINNER, ...ML_ROADMAP_INTERMEDIATE, ...ML_ROADMAP_ADVANCED];

// Level content (main content area)
export const getFallbackContent = (node) => ({
  title: node.title || 'Unknown Topic',
  subtitle: `A comprehensive overview of ${node.title || 'this topic'}`,
  xp: node.xp || 300,
  video_summary: `This is a generated placeholder summary for ${node.title}.\n\nIn this module, you will learn the foundational concepts, mathematical intuitions, and real-world applications of this technology. By the end of this level, you'll be able to practically implement these concepts.`,
  manim_code: `from manim import *\n# Code for ${node.title}\nclass Animation(Scene):\n    def construct(self):\n        title = Text("${node.title}").scale(1.5)\n        self.play(Write(title))\n        self.wait(2)`,
  slides: [
    { num: 1, title: `Introduction to ${node.title}`, bullets: ['Foundational theory and context', 'Why this matters in the real world'], visual: 'Diagram showing architecture' },
    { num: 2, title: `Mathematical Foundations`, bullets: ['Equation breakdown', 'Underlying intuitions'], visual: 'Graph or plot' }
  ],
  key_concepts: [
    { term: 'Core Principle', def: `The fundamental idea behind ${node.title}` },
    { term: 'Application', def: `How it is used in industry` }
  ],
  flashcards: [
    { q: `What is the primary goal of ${node.title}?`, a: 'To solve complex domain-specific problems efficiently.' },
    { q: `Name one key advantage of this approach.`, a: 'It scales well with large datasets and handles non-linearities.' }
  ]
});

export const LEVEL_CONTENT = {
  5: {
    title: 'Supervised Learning',
    subtitle: 'The art of learning from labeled data',
    xp: 300,
    manim_code: `<span class="cm"># ============================================================
# LearnQuest Manim Animation: Supervised Learning
# Generated for: Machine Learning / Level 5
# ============================================================</span>

<span class="kw">from</span> manim <span class="kw">import</span> *
<span class="kw">import</span> numpy <span class="kw">as</span> np

<span class="kw">class</span> <span class="fn">SupervisedLearningScene</span>(Scene):
    <span class="kw">def</span> <span class="fn">construct</span>(self):
        <span class="cm"># --- Title ---</span>
        title = Text(<span class="str">"Supervised Learning"</span>, font_size=<span class="num">48</span>, color=TEAL)
        subtitle = Text(<span class="str">"Learning from Labeled Data"</span>, font_size=<span class="num">28</span>, color=GRAY)
        subtitle.next_to(title, DOWN, buff=<span class="num">0.3</span>)
        self.play(Write(title), FadeIn(subtitle))
        self.wait(<span class="num">1</span>)
        self.play(FadeOut(title), FadeOut(subtitle))

        <span class="cm"># --- Training Dataset Visualization ---</span>
        axes = Axes(x_range=[<span class="num">0</span>,<span class="num">10</span>], y_range=[<span class="num">0</span>,<span class="num">10</span>],
                    axis_config={<span class="str">"color"</span>: WHITE})
        x_label = axes.get_x_axis_label(<span class="str">"Feature X"</span>)
        y_label = axes.get_y_axis_label(<span class="str">"Feature Y"</span>)
        self.play(Create(axes), Write(x_label), Write(y_label))

        <span class="cm"># --- Labeled data points ---</span>
        class_a = [(<span class="num">2</span>,<span class="num">3</span>),(<span class="num">3</span>,<span class="num">4</span>),(<span class="num">2.5</span>,<span class="num">5</span>),(<span class="num">1.5</span>,<span class="num">3.5</span>)]
        class_b = [(<span class="num">7</span>,<span class="num">6</span>),(<span class="num">8</span>,<span class="num">7</span>),(<span class="num">6.5</span>,<span class="num">8</span>),(<span class="num">7.5</span>,<span class="num">5.5</span>)]
        dots_a = VGroup(*[Dot(axes.coords_to_point(x,y),
                   color=BLUE, radius=<span class="num">0.15</span>) <span class="kw">for</span> x,y <span class="kw">in</span> class_a])
        dots_b = VGroup(*[Dot(axes.coords_to_point(x,y),
                   color=RED, radius=<span class="num">0.15</span>) <span class="kw">for</span> x,y <span class="kw">in</span> class_b])
        label_a = Text(<span class="str">"Class A"</span>, color=BLUE, font_size=<span class="num">22</span>)
        label_b = Text(<span class="str">"Class B"</span>, color=RED, font_size=<span class="num">22</span>)
        
        self.play(LaggedStartMap(GrowFromCenter, dots_a))
        self.play(LaggedStartMap(GrowFromCenter, dots_b))

        <span class="cm"># --- Decision Boundary ---</span>
        boundary = axes.plot(
            <span class="kw">lambda</span> x: <span class="num">0.8</span>*x + <span class="num">1.5</span>,
            color=GREEN, stroke_width=<span class="num">3</span>
        )
        boundary_label = Text(<span class="str">"Decision Boundary"</span>, color=GREEN, font_size=<span class="num">22</span>)
        self.play(Create(boundary))
        self.play(Write(boundary_label))
        self.wait(<span class="num">2</span>)

        <span class="cm"># --- New prediction point ---</span>
        new_point = Dot(axes.coords_to_point(<span class="num">5</span>,<span class="num">5</span>), color=YELLOW, radius=<span class="num">0.2</span>)
        question = Text(<span class="str">"?"</span>, font_size=<span class="num">36</span>, color=YELLOW)
        self.play(GrowFromCenter(new_point), Write(question))
        self.wait(<span class="num">1</span>)
        self.play(new_point.animate.set_color(RED))
        result = Text(<span class="str">"→ Predicted: Class B"</span>, color=RED, font_size=<span class="num">28</span>)
        self.play(Write(result))
        self.wait(<span class="num">2</span>)`,
    slides: [
      { num: 1, title: 'What is Supervised Learning?', bullets: ['Learning from labeled training data', 'Model maps inputs X to outputs Y', 'Goal: generalize to unseen examples'], visual: 'Diagram of input → model → output with labeled pairs' },
      { num: 2, title: 'The Training Process', bullets: ['Feed data through the model', 'Compare predictions to true labels', 'Update model weights via backpropagation'], visual: 'Animated feedback loop diagram' },
      { num: 3, title: 'Classification vs Regression', bullets: ['Classification: predict discrete labels', 'Regression: predict continuous values', 'Both are forms of supervised learning'], visual: 'Side-by-side scatter plot examples' },
      { num: 4, title: 'Key Algorithms', bullets: ['Linear/Logistic Regression', 'Decision Trees', 'k-Nearest Neighbors (kNN)', 'Support Vector Machines (SVM)'], visual: 'Algorithm comparison table' },
      { num: 5, title: 'Overfitting & Underfitting', bullets: ['Overfitting: memorizes training data', 'Underfitting: model too simple', 'Goal: find the sweet spot (generalization)'], visual: 'Bias-variance tradeoff curve' },
    ]
  }
};

// Flashcards per level
export const FLASHCARDS = {
  5: [
    { q: 'What is Supervised Learning?', a: 'A type of ML where the model learns from labeled training data (input-output pairs) to make predictions on new, unseen data.' },
    { q: 'What is the difference between Classification and Regression?', a: 'Classification predicts discrete categories (cat vs dog). Regression predicts continuous values (house price).' },
    { q: 'What is Overfitting?', a: 'When a model learns the training data too well, including its noise, and fails to generalize to new data. High train accuracy, low test accuracy.' },
    { q: 'What is a Loss Function?', a: 'A mathematical function that measures how wrong the model\'s predictions are. The training process minimizes this function.' },
    { q: 'What is the Bias-Variance Tradeoff?', a: 'High bias = underfitting (too simple). High variance = overfitting (too complex). Goal: balance both for best generalization.' },
    { q: 'What is Cross-Validation?', a: 'A technique to evaluate model performance by splitting data into multiple train/test folds and averaging results.' },
    { q: 'Name 3 supervised learning algorithms', a: 'Linear Regression, Decision Trees, k-Nearest Neighbors (kNN), Logistic Regression, SVM, Random Forest' },
    { q: 'What is a training set vs test set?', a: 'Training set: data the model learns from. Test set: held-out data used to evaluate final performance. Never train on test data!' },
  ]
};

// AI Tutor chat responses (keyword-based)
export const TUTOR_RESPONSES = {
  default: [
    "Great question! Supervised learning is fundamentally about learning a mapping from inputs to outputs using labeled examples. Think of it like a student learning from a teacher who provides the correct answers.",
    "Let me give you an analogy: imagine teaching a child to recognize cats by showing them thousands of pictures labeled 'cat' or 'not cat'. The child (model) learns the patterns. That's supervised learning!",
    "The key insight is that the model never truly 'understands' the concept — it learns statistical patterns that correlate inputs to outputs. This is both its power and its limitation.",
  ],
  overfit: [
    "Overfitting is like memorizing the textbook instead of understanding the material. You ace the practice questions but fail the actual exam!",
    "To combat overfitting: use regularization (L1/L2), dropout (for neural nets), cross-validation, or simply get more training data.",
  ],
  simple: [
    "Imagine you're teaching a robot to sort fruit. You show it 1000 apples and 1000 oranges, each labeled. After training, it can classify new fruit it's never seen. That's supervised learning in a nutshell!",
    "Here's the simplest way to think about it: supervised learning = learning by example with a teacher who corrects your mistakes every step of the way.",
  ],
  analogy: [
    "🎯 Real-world analogy: A spam filter is supervised learning. It's trained on millions of emails labeled 'spam' or 'not spam'. Now it can classify your new emails automatically.",
    "Medical diagnosis AI is another great example — trained on thousands of X-rays labeled with diagnoses, it learns to detect diseases in new scans.",
  ],
  mistake: [
    "⚠️ Common mistakes: 1) Not splitting train/test data properly, 2) Tuning on the test set (data leakage!), 3) Ignoring class imbalance, 4) Not normalizing features.",
    "Another big mistake: choosing model complexity without cross-validation. Always validate your model's performance on unseen data before declaring victory!",
  ],
};
