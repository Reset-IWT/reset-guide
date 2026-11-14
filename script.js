// ==========================================
// PASTE YOUR GOOGLE APPS SCRIPT WEB APP URL BELOW
// ==========================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyvQcm6a424EnX2q0H46-a8mN1z7sihztxSo9feG3ctujgHj_OXu2eD7-kNY_krnOrn/exec';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('questionnaireForm');
    const submitBtn = document.getElementById('submitBtn');
    const resultsDiv = document.getElementById('results');
    const confirmationMessageDiv = document.getElementById('confirmationMessage');
    const formError = document.getElementById('formError');

    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent page reload

        // Hide any previous error messages
        formError.classList.add('results-hidden');
        formError.textContent = '';

        // Collect Name and Email
        const participantName = document.getElementById('participantName').value.trim();
        const participantEmail = document.getElementById('participantEmail').value.trim();

        if (!participantName || !participantEmail) {
            formError.textContent = 'Please enter both your name and email address.';
            formError.classList.remove('results-hidden');
            return;
        }

        const answers = {};
        // Get all 30 questions (radio button groups)
        for (let i = 1; i <= 30; i++) {
            const questionName = `q${i}`;
            const selectedOption = document.querySelector(`input[name="${questionName}"]:checked`);
            if (selectedOption) {
                answers[questionName] = parseInt(selectedOption.value);
            } else {
                alert(`Please answer question ${i}.`);
                return;
            }
        }

        // 1. Invert scores for specific questions
        const questionsToInvert = [2, 7, 9, 10, 11, 12, 14, 15, 16, 17, 20, 27, 29, 30];
        const invertedAnswers = { ...answers };

        questionsToInvert.forEach(qNum => {
            const questionKey = `q${qNum}`;
            if (invertedAnswers[questionKey] !== undefined) {
                const originalScore = invertedAnswers[questionKey];
                invertedAnswers[questionKey] = 6 - originalScore;
            }
        });

        // 2. Calculate average scores for each classification
        function calculateAverage(questionNumbers, sourceAnswers) {
            let sum = 0;
            questionNumbers.forEach(qNum => {
                sum += sourceAnswers[`q${qNum}`] || 0;
            });
            return sum / questionNumbers.length;
        }

        const classificationScores = {
            selfIdentityDeficits: calculateAverage([2, 17, 19, 25, 27, 28], invertedAnswers),
            addictiveTendencies: calculateAverage([5, 6, 8, 12, 20, 26], invertedAnswers),
            hyperphobicTendencies: calculateAverage([3, 7, 13, 15, 22, 30], invertedAnswers),
            sensoryIntegrationDeficits: calculateAverage([1, 4, 10, 11, 16, 24], invertedAnswers),
            physicalDeficits: calculateAverage([9, 14, 18, 21, 23, 29], invertedAnswers)
        };

        // 3. Find the classification with the highest score
        let highestScore = 0;
        let highestScoringClassification = '';

        for (const classification in classificationScores) {
            if (classificationScores.hasOwnProperty(classification)) {
                if (classificationScores[classification] > highestScore) {
                    highestScore = classificationScores[classification];
                    highestScoringClassification = classification;
                }
            }
        }

        // Clean titles for the email subject line and Google Sheet record
        const pathTitles = {
            selfIdentityDeficits: 'The Blue Path: Cultivating Your Inner Compass',
            addictiveTendencies: 'The Red Path: Building Self-Regulation',
            hyperphobicTendencies: 'The Green Path: Navigating Challenges with Calm',
            sensoryIntegrationDeficits: 'The Yellow Path: Harmonizing Your Senses',
            physicalDeficits: 'The Orange Path: Strengthening Your Foundation'
        };

        // 4. Activity descriptions sent in the email
        const activities = {
            selfIdentityDeficits: `
                <h3>The Blue Path: Cultivating Your Inner Compass</h3>
                <p>These activities focus on exploring and strengthening your sense of self.</p>
                
                <h4>1. Journaling on True Compliments and Core Values</h4>
                <p><strong>How to do it:</strong> Find a quiet space. Reflect on genuine compliments you've received that resonate with you, and write them down. Then, list and define your core values (e.g., honesty, creativity, compassion). For each value, write down why it's important to you and how you embody it.</p>
                <p><strong>How often:</strong> Aim for 3-5 times a week, dedicating 10-15 minutes each session.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: After defining your values, brainstorm specific actions you can take daily to live by those values. Consider how to "defend" them in challenging situations (e.g., politely declining a request that goes against your value of personal time).</li>
                    <li>Easier: Start with just one true compliment or one core value per session. Focus on simply identifying them without extensive elaboration.</li>
                </ul>

                <h4>2. Volunteering</h4>
                <p><strong>How to do it:</strong> Identify a cause or organization that aligns with your interests or values (e.g., animal shelter, food bank, community clean-up). Research local opportunities and sign up for a single shift or a short-term project to start.</p>
                <p><strong>How often:</strong> Begin with once a month or once every few weeks.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Increase the frequency or duration of your volunteering. Take on more responsibility within the organization or seek out leadership roles.</li>
                    <li>Easier: Start with very low-commitment activities, like donating items, or helping a friend with a small task that benefits others.</li>
                </ul>

                <h4>3. Solutions Focused Approach (Self-Application)</h4>
                <p><strong>How to do it:</strong> When facing a challenge or wanting to build a new habit (like self-care), ask yourself: "What small step can I take today to move towards my desired outcome?" or "What would be different if this problem were solved?" Focus on identifying exceptions to problems and what is already working.</p>
                <p><strong>How often:</strong> Daily, as part of your morning routine or whenever you encounter a decision point.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Apply this approach to larger, more complex goals. Break down significant aspirations into a series of achievable, solutions-focused steps.</li>
                    <li>Easier: Start with very simple goals, like "How can I get 5 extra minutes of sleep tonight?" or "What's one small thing I can do to feel more organized today?"</li>
                </ul>

                <h4>4. Minimalism (2-Year Rule)</h4>
                <p><strong>How to do it:</strong> Go through your belongings. For any item, ask yourself: "Have I used this in the last 2 years?" If not, consider donating, selling, or discarding it. The goal is to reduce clutter and focus on what truly adds value to your life.</p>
                <p><strong>How often:</strong> Dedicate one hour per week to a specific area (e.g., one closet, one drawer, one shelf).</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Progress to a "1-year rule," then a "6-month rule." This means if you haven't used an item in that shorter timeframe, it's time to let it go. Extend this thinking to digital clutter (emails, files).</li>
                    <li>Easier: Start with one small, low-stakes area like your desk drawer or a single shelf. Don't feel pressured to get rid of anything, just sort and observe.</li>
                </ul>
            `,
            addictiveTendencies: `
                <h3>The Red Path: Building Self-Regulation</h3>
                <p>These activities help build coping mechanisms and appreciation for delayed gratification.</p>

                <h4>1. Mindful Breathing When Triggered (e.g., Phone Ring)</h4>
                <p><strong>How to do it:</strong> When you feel a strong urge or a trigger (like your phone ringing if you have endless desires related to it), pause before acting. Take 3-5 slow, deep breaths, focusing on the sensation of your breath. Notice the urge without immediately giving in to it.</p>
                <p><strong>How often:</strong> Practice every time a trigger occurs. Consistent daily practice, even when not triggered, can build the skill.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Extend the pause to 10-15 breaths. During the pause, briefly reflect on the potential consequences of giving in to the urge versus the benefits of delaying or choosing an alternative.</li>
                    <li>Easier: Start by just taking one conscious breath. Focus only on the in-breath and out-breath, without any judgment.</li>
                </ul>

                <h4>2. Scheduling and Streak Building (Days Since App/Calendar)</h4>
                <p><strong>How to do it:</strong> For a desired positive habit you want to build (or an addictive behavior you want to reduce), use a "Days Since" app or mark a calendar. Each day you successfully engage in the positive habit (or abstain from the negative), mark it down. The goal is to build a streak of consecutive days.</p>
                <p><strong>How often:</strong> Daily tracking for the habit you are focusing on.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Combine multiple habits you want to track. Set personal "streak goals" (e.g., 7 days, 30 days, 90 days). Reward yourself for reaching milestones (non-addictive rewards).</li>
                    <li>Easier: Start with just one very small, achievable goal (e.g., "Days Since I drank a soda"). Focus solely on marking the days, without pressure for long streaks initially.</li>
                </ul>

                <h4>3. Art/Music Practice (or any Delayed Gratification Activity)</h4>
                <p><strong>How to do it:</strong> Choose an activity that requires sustained effort to see results, such as learning a new instrument, drawing, painting, knitting, or gardening. Dedicate a specific time each day or week to practice. Focus on the process and gradual improvement rather than immediate perfection.</p>
                <p><strong>How often:</strong> 3-4 times a week, for 15-30 minutes per session.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Set a small project goal (e.g., learn a simple song, complete a small sketch, grow a specific plant). Enroll in a beginner's online course or follow structured tutorials.</li>
                    <li>Easier: Start with very short, unstructured sessions (5-10 minutes). Simply doodle, hum, or explore materials without any specific objective. The goal is just to engage.</li>
                </ul>

                <h4>4. Support Groups and Journaling</h4>
                <p><strong>How to do it:</strong> Research and attend a local or online support group relevant to your addictive tendencies (e.g., AA, NA, SMART Recovery, general well-being groups). After each meeting, spend 5-10 minutes journaling about your experience: what resonated with you, what insights you gained, and how you felt.</p>
                <p><strong>How often:</strong> Attend meetings as recommended by the group (e.g., weekly) and journal immediately afterward.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Actively participate in group discussions, share your own experiences (when comfortable), and offer support to others. Use your journal to delve deeper into themes and challenges discussed in the group.</li>
                    <li>Easier: Attend anonymously and just listen. In your journal, simply note down one phrase or idea that stood out to you.</li>
                </ul>
            `,
            hyperphobicTendencies: `
                <h3>The Green Path: Navigating Challenges with Calm</h3>
                <p>These activities aim to reduce stress responses and gradually expose you to fears.</p>

                <h4>1. Relaxation Techniques (3 Breaths / "Say Yes")</h4>
                <p><strong>How to do it:</strong> When feeling anxious or overwhelmed, immediately pause. Take three slow, deep breaths, focusing on making your exhale longer than your inhale. Alternatively, try the "Say Yes" technique: as you breathe in, mentally say "yes" to whatever sensation or feeling is present, without judgment.</p>
                <p><strong>How often:</strong> Practice multiple times daily, especially when stress or anxiety begins to build.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Extend the duration of the relaxation practice (e.g., 5-10 minutes). Combine it with body scans, noticing where tension is held and gently releasing it.</li>
                    <li>Easier: Focus on just one deep breath. The goal is to create a small pause and re-center, even for a moment.</li>
                </ul>

                <h4>2. Mental/Motor Imagery (Initial Graded Exposure)</h4>
                <p><strong>How to do it:</strong> For a specific fear, sit in a comfortable, safe place. Close your eyes and vividly imagine yourself successfully navigating a very mild, non-threatening aspect of your fear. For example, if you fear public speaking, imagine yourself calmly standing in front of one friendly person. If you fear heights, imagine looking out a first-story window. Engage all your senses in the imagery.</p>
                <p><strong>How often:</strong> 3-5 times a week, for 5-10 minutes per session.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Gradually increase the intensity of the imagined scenario (e.g., imagining speaking to a small group, looking out a slightly higher window). Combine with actual small motor movements if applicable (e.g., imagine tying a shoelace if you fear untied laces).</li>
                    <li>Easier: Start with imagining a completely neutral or positive image. Focus only on relaxation during the imagery.</li>
                </ul>

                <h4>3. Reflection and Journaling of New Experiences</h4>
                <p><strong>How to do it:</strong> After a new or challenging experience, particularly one that involved confronting a small fear or stepping outside your comfort zone, take time to journal. Describe what happened, how you felt before, during, and after, what you learned, and any insights gained.</p>
                <p><strong>How often:</strong> As needed, after any relevant experience. Aim for at least once a week if actively working on exposures.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: In your journaling, specifically challenge any negative thought patterns that arose during the experience. Reframe them into more realistic or positive self-talk.</li>
                    <li>Easier: Simply list one or two objective facts about the new experience without delving into feelings or interpretations.</li>
                </ul>

                <h4>4. Stress Inoculation Training (Self-Application)</h4>
                <p><strong>How to do it:</strong> Identify a common stressor or fear-inducing situation you anticipate. Before it happens, mentally rehearse coping strategies. For example, if you have a presentation, imagine yourself taking deep breaths, focusing on your notes, and speaking clearly. Think about potential difficulties and how you would respond calmly.</p>
                <p><strong>How often:</strong> Practice 1-2 times a week for anticipated stressors.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Apply SIT to more complex or unpredictable situations. In your mental rehearsal, introduce unexpected challenges and practice adapting your coping mechanisms.</li>
                    <li>Easier: Start with a very minor stressor (e.g., preparing for a routine phone call). Focus on just one simple coping strategy, like reminding yourself to speak slowly.</li>
                </ul>
            `,
            sensoryIntegrationDeficits: `
                <h3>The Yellow Path: Harmonizing Your Senses</h3>
                <p>These activities help you gradually adapt to different sensory experiences.</p>

                <h4>1. Graded Introduction of Untolerated Sensations (During Motor Activity)</h4>
                <p><strong>How to do it:</strong> Choose a motor activity you do regularly (e.g., walking, sitting). Introduce a very mild, untolerated sensation during this activity. For example, if specific textures bother your feet, start by walking on a soft carpet, then firm carpet, then wood, then tile, then gravel, and finally, legos. The key is gradual progression.</p>
                <p><strong>How often:</strong> Daily, or every other day, for 5-10 minutes. Only progress when the current level is comfortable.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Gradually introduce more intense versions of the untolerated sensation, or combine multiple untolerated sensations during the activity.</li>
                    <li>Easier: Start with an extremely subtle version of the sensation, or just imagine the sensation without actual physical contact. Focus on brief exposure.</li>
                </ul>

                <h4>2. Graded Reduction of Preferred Sensations (During Motor Activity)</h4>
                <p><strong>How to do it:</strong> Identify a preferred sensation or comfort item you rely on during a motor activity (e.g., fidget toy during soccer, calming music during studying). Gradually reduce its presence. For example, allow the fidget toy/scented candle/calming music during all of the activity, then for only half, then for only a quarter, then only at the beginning, and finally, not at all.</p>
                <p><strong>How often:</strong> Daily, or every other day, for 5-10 minutes. Only reduce the sensation when the current level is comfortable.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Apply this to more essential preferred sensations. Work on tolerating longer periods without the preferred sensation.</li>
                    <li>Easier: Start with a very small reduction in the preferred sensation, or only remove it for a few seconds before reintroducing it.</li>
                </ul>

                <h4>3. Reflection and Journaling of Sensory Experiences</h4>
                <p><strong>How to do it:</strong> Throughout your day, pay attention to how different sensory experiences (e.g., light, temperature, textures, sounds) influence your mood, thoughts, and symptoms. At the end of the day, or during a designated time, journal about these observations. Note patterns and specific triggers.</p>
                <p><strong>How often:</strong> Daily, for 5-10 minutes.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: In your journaling, explore strategies for proactively managing sensory input. For instance, if bright lights are a trigger, brainstorm ways to adjust lighting in your environment.</li>
                    <li>Easier: Simply list one sensory experience that felt comfortable and one that felt uncomfortable each day.</li>
                </ul>

                <h4>4. Mindful Posture (as a Sensory Integration tool)</h4>
                <p><strong>How to do it:</strong> Periodically throughout the day, bring your awareness to your posture. Notice how your body feels. Are you slumped? Tense? Gently adjust your posture to be more upright and relaxed. Pay attention to the subtle sensory feedback from your body as you make these adjustments.</p>
                <p><strong>How often:</strong> 5-10 times throughout the day, for 1-2 minutes each time.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Combine mindful posture with mindful movement (e.g., walking mindfully, noticing the sensation of your feet on the ground).</li>
                    <li>Easier: Just notice your breathing for a few seconds. Allow this to be your cue to check in with your posture, even if you don't adjust it immediately.</li>
                </ul>
            `,
            physicalDeficits: `
                <h3>The Orange Path: Strengthening Your Foundation</h3>
                <p>These activities focus on improving physical well-being and body awareness.</p>

                <h4>1. Mindful Walking</h4>
                <p><strong>How to do it:</strong> When you walk, pay attention to the sensations in your feet, the rhythm of your steps, the swing of your arms, and your breath. Notice the environment around you without judgment. If your mind wanders, gently bring it back to the act of walking.</p>
                <p><strong>How often:</strong> 10-15 minutes daily, or during a portion of your regular walks.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Extend the duration of your mindful walking. Try walking in different environments (e.g., uneven terrain, busy streets) while maintaining awareness.</li>
                    <li>Easier: Start with just 2-3 minutes of mindful walking. Focus on only one sensation, like the feeling of your feet touching the ground.</li>
                </ul>

                <h4>2. Silly Walking (Playful Movement)</h4>
                <p><strong>How to do it:</strong> Engage in short bursts of playful, non-traditional walking or movement. This could involve walking on your tiptoes, doing high knees, skipping, or making up your own movements. The goal is to break habitual movement patterns and introduce novelty and lightheartedness.</p>
                <p><strong>How often:</strong> 1-2 times daily, for 2-5 minutes each time, or whenever you need a quick energy shift.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Incorporate more complex or varied "silly walks" into your routine. Try coordinating with music or adding expressive movements.</li>
                    <li>Easier: Start with just a few seconds of a very simple "silly walk," like marching in place. The emphasis is on fun, not perfection.</li>
                </ul>

                <h4>3. Basic Mobility Work</h4>
                <p><strong>How to do it:</strong> Incorporate simple stretches and joint rotations into your daily routine. Examples include neck rolls, shoulder circles, wrist rotations, ankle circles, and gentle stretches for your hamstrings and quadriceps. Focus on smooth, controlled movements within your comfortable range of motion.</p>
                <p><strong>How often:</strong> Daily, for 5-10 minutes, perhaps in the morning or before bed.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Hold stretches for longer durations (20-30 seconds). Explore more complex yoga or Pilates routines if appropriate for your body.</li>
                    <li>Easier: Do fewer repetitions or shorter holds for each movement. Focus on just one or two body areas to start.</li>
                </ul>

                <h4>4. Formulate Questions for Other Providers (Self-Advocacy)</h4>
                <p><strong>How to do it:</strong> Before any medical appointment or interaction with a healthcare provider, take 5-10 minutes to write down any questions, concerns, or observations you have about your health. This helps you remember important points and ensures you get the information you need.</p>
                <p><strong>How often:</strong> Before every medical appointment or whenever a health-related question arises.</p>
                <p><strong>Progress:</strong></p>
                <ul>
                    <li>More challenging: Practice articulating your questions clearly and concisely. Consider writing down the answers you receive during the appointment for future reference.</li>
                    <li>Easier: Just write down one key question or concern before an appointment. The goal is to start the habit of preparation.</li>
                </ul>
            `
        };

        // 5. Prepare payload and send to Google Apps Script
        const payload = {
            name: participantName,
            email: participantEmail,
            pathTitle: pathTitles[highestScoringClassification],
            activitiesHtml: activities[highestScoringClassification],
            scores: classificationScores
        };

        // Disable button while sending to prevent duplicate submissions
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending Results...';

        try {
            // Note: text/plain avoids browser CORS preflight checks with Google Apps Script
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.status === 'success') {
                // Hide the form and display the email-only confirmation message
                form.style.display = 'none';
                confirmationMessageDiv.innerHTML = `
                    <p>Thank you, <strong>${participantName}</strong>!</p>
                    <p>We have emailed your personalized CogSyF results and activity guide to <strong>${participantEmail}</strong>.</p>
                    <p><em>(If you don't see it within a minute or two, please check your spam or promotions folder.)</em></p>
                `;
                resultsDiv.classList.remove('results-hidden');
                resultsDiv.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(result.message || 'Server returned an error.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            formError.textContent = 'Something went wrong while sending your email. Please double-check your email address and try again.';
            formError.classList.remove('results-hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Email My Results';
        }
    });
});
