(function () {
  'use strict';

  const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  const fmt = (x, d = 3) => {
    let v = Number((Math.round(x * 10 ** d) / 10 ** d).toFixed(d));
    if (v === 0) v = 0;
    return String(v);
  };
  const H2 = (a, b) => {
    const n = a + b;
    if (!n) return 0;
    return [a, b].reduce((acc, c) => (c > 0 ? acc + (c / n) * Math.log2(n / c) : acc), 0);
  };
  const gini2 = (a, b) => {
    const n = a + b;
    if (!n) return 0;
    const p = a / n;
    return 1 - (p * p + (1 - p) * (1 - p));
  };
  const sig = (z) => 1 / (1 + Math.exp(-z));

  const store = {
    get(k, def) {
      try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; }
    },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); } catch {}
    }
  };

  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    const setLabel = () => {
      const cur = document.documentElement.dataset.theme;
      const dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeBtn.textContent = dark ? 'Light' : 'Dark';
    };
    setLabel();
    themeBtn.addEventListener('click', () => {
      const cur = document.documentElement.dataset.theme;
      const isDark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      const next = isDark ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      store.set('dsl501.theme', next);
      setLabel();
    });
  }

  // Copy code buttons
  document.querySelectorAll('.codeblock').forEach((blk) => {
    const btn = blk.querySelector('.copy-btn');
    const code = blk.querySelector('pre code');
    if (!btn || !code) return;
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        btn.textContent = 'Copied';
        setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
      } catch {
        btn.textContent = 'Select manually';
      }
    });
  });

  // Numerical practice generators (1 per lab topic)
  const GEN = {
    dt_split: {
      title: 'Quick Drill · Gini & Entropy Split (Lab 7)',
      make() {
        let a, b, c, d;
        do {
          a = rint(0, 6); b = rint(0, 6); c = rint(0, 6); d = rint(0, 6);
        } while (a + b < 2 || c + d < 2 || a + c < 1 || b + d < 1);
        const n = a + b + c + d;
        const gL = gini2(a, b), gR = gini2(c, d);
        const wGini = ((a + b) / n) * gL + ((c + d) / n) * gR;
        const hP = H2(a + c, b + d), hL = H2(a, b), hR = H2(c, d);
        const wEnt = ((a + b) / n) * hL + ((c + d) / n) * hR;
        const ig = hP - wEnt;
        return {
          prompt: `Parent has <b>${a + c} class-0, ${b + d} class-1</b> (${n} samples). Candidate split gives Left = <b>[${a}, ${b}]</b> and Right = <b>[${c}, ${d}]</b>. Compute Weighted Gini and Information Gain (log base 2).`,
          fields: [
            { l: 'Weighted Gini', a: wGini },
            { l: 'Weighted Entropy', a: wEnt },
            { l: 'Information Gain', a: ig }
          ],
          steps: `<ol>
            <li>Gini(L) = 1 − (${a}/${a+b})² − (${b}/${a+b})² = ${fmt(gL)} · Gini(R) = ${fmt(gR)}</li>
            <li>Weighted Gini = (${a+b}/${n})·${fmt(gL)} + (${c+d}/${n})·${fmt(gR)} = <b>${fmt(wGini)}</b></li>
            <li>H(parent) = ${fmt(hP)}, H(L) = ${fmt(hL)}, H(R) = ${fmt(hR)}</li>
            <li>Weighted Entropy = (${a+b}/${n})·${fmt(hL)} + (${c+d}/${n})·${fmt(hR)} = <b>${fmt(wEnt)}</b></li>
            <li>Information Gain = H(parent) − Weighted Entropy = ${fmt(hP)} − ${fmt(wEnt)} = <b>${fmt(ig)}</b></li>
          </ol>`
        };
      }
    },

    rf_var: {
      title: 'Quick Drill · Forest Variance & Feature Count (Lab 7)',
      make() {
        const p = pick([4, 9, 16, 25, 36]);
        const B = pick([10, 20, 25, 50]);
        const rho = pick([0.2, 0.3, 0.4, 0.5]);
        const sigma2 = pick([1, 2, 4]);
        const m = Math.round(Math.sqrt(p));
        const varForest = (rho + (1 - rho) / B) * sigma2;
        return {
          prompt: `A Random Forest for classification uses <b>p = ${p}</b> features, <b>B = ${B}</b> trees, each tree has variance <b>σ² = ${sigma2}</b>, and pairwise tree correlation is <b>ρ = ${rho}</b>.`,
          fields: [
            { l: 'Features sampled per split (m = √p)', a: m, tol: 0.001 },
            { l: 'Ensemble Variance', a: varForest }
          ],
          steps: `<ol>
            <li>Classification default in Lab 7 (<code>max_features="sqrt"</code>): m = √${p} = <b>${m}</b></li>
            <li>Variance = ρσ² + ((1 − ρ)/B)σ² = ${rho}×${sigma2} + ((1 − ${rho})/${B})×${sigma2} = <b>${fmt(varForest)}</b></li>
          </ol>`
        };
      }
    },

    knn_dist: {
      title: 'Quick Drill · Euclidean Distance & K=3 Vote (Lab 6)',
      make() {
        let pts, q, ds, order;
        do {
          pts = [
            { x: [rint(0, 3), rint(0, 3)], y: 0 },
            { x: [rint(1, 4), rint(1, 4)], y: 0 },
            { x: [rint(3, 6), rint(3, 6)], y: 1 },
            { x: [rint(4, 7), rint(4, 7)], y: 1 }
          ];
          q = [rint(2, 5), rint(2, 5)];
          ds = pts.map((p) => Math.hypot(p.x[0] - q[0], p.x[1] - q[1]));
          order = [0, 1, 2, 3].sort((i, j) => ds[i] - ds[j]);
        } while (Math.abs(ds[order[2]] - ds[order[3]]) < 1e-9); // avoid ambiguous 3rd/4th tie
        const k3 = order.slice(0, 3);
        const votes1 = k3.filter((i) => pts[i].y === 1).length;
        const pred = votes1 >= 2 ? 1 : 0;
        return {
          prompt: `Training points: A=(${pts[0].x})→0, B=(${pts[1].x})→0, C=(${pts[2].x})→1, D=(${pts[3].x})→1. Query <b>x_q=(${q})</b> with <b>K=3</b>.`,
          fields: [
            { l: 'Distance to A', a: ds[0] },
            { l: 'Distance to C', a: ds[2] },
            { l: 'Predicted class (0 or 1)', a: pred, tol: 0.001 }
          ],
          steps: `<ol>
            <li>d(A) = ${fmt(ds[0])}, d(B) = ${fmt(ds[1])}, d(C) = ${fmt(ds[2])}, d(D) = ${fmt(ds[3])}</li>
            <li>3 nearest indices: ${k3.map(i => `${'ABCD'[i]}(y=${pts[i].y}, d=${fmt(ds[i])})`).join(', ')}</li>
            <li>Majority vote → <b>class ${pred}</b></li>
          </ol>`
        };
      }
    },

    nn_step: {
      title: 'Quick Drill · 1-Neuron Forward & BCE Gradient (Lab 8)',
      make() {
        const x1 = pick([-1, 0.5, 1, 2]), x2 = pick([-1, 0, 1]);
        const w1 = pick([0.5, 1, -0.5]), w2 = pick([0.5, -1, 1]), b = pick([0, 0.5, -0.5]);
        const y = pick([0, 1]);
        const z = w1 * x1 + w2 * x2 + b;
        const a = sig(z);
        const delta = a - y;
        const dw1 = delta * x1;
        return {
          prompt: `Single sigmoid neuron with x = (${x1}, ${x2}), w = (${w1}, ${w2}), b = ${b}, true label <b>y = ${y}</b>, and Binary Cross-Entropy loss.`,
          fields: [
            { l: 'Pre-activation z', a: z },
            { l: 'Output a = σ(z)', a: a },
            { l: 'Output delta = dL/dz = a − y', a: delta },
            { l: 'Weight grad dL/dw₁', a: dw1 }
          ],
          steps: `<ol>
            <li>z = (${w1})(${x1}) + (${w2})(${x2}) + (${b}) = <b>${fmt(z)}</b></li>
            <li>a = 1 / (1 + e<sup>−z</sup>) = <b>${fmt(a)}</b></li>
            <li>For Sigmoid + BCE, dL/dz = a − y = ${fmt(a)} − ${y} = <b>${fmt(delta)}</b></li>
            <li>dL/dw₁ = (dL/dz)·x₁ = ${fmt(delta)} × ${x1} = <b>${fmt(dw1)}</b></li>
          </ol>`
        };
      }
    },

    cnn_shape: {
      title: 'Quick Drill · CNN Output Size & Parameters (Lab 10)',
      make() {
        const W1 = pick([28, 32, 64, 224]);
        const F = pick([3, 5]);
        const P = pick([0, 1, 2]);
        const S = pick([1, 2]);
        const Cin = pick([1, 3, 32]);
        const K = pick([16, 32, 64]);
        const W2 = Math.floor((W1 - F + 2 * P) / S) + 1;
        const params = (F * F * Cin + 1) * K;
        return {
          prompt: `Input volume <b>${W1} × ${W1} × ${Cin}</b> enters <code>nn.Conv2d(${Cin}, ${K}, kernel_size=${F}, stride=${S}, padding=${P})</code>.`,
          fields: [
            { l: 'Output width W₂', a: W2, tol: 0.001 },
            { l: 'Output channels D₂', a: K, tol: 0.001 },
            { l: 'Conv layer parameters (with bias)', a: params, tol: 0.5 }
          ],
          steps: `<ol>
            <li>W₂ = floor((${W1} − ${F} + 2×${P}) / ${S}) + 1 = <b>${W2}</b></li>
            <li>Output channels D₂ = number of filters K = <b>${K}</b> (output volume ${W2}×${W2}×${K})</li>
            <li>Params = (F×F×C<sub>in</sub> + 1) × K = (${F}×${F}×${Cin} + 1) × ${K} = <b>${params}</b></li>
          </ol>`
        };
      }
    },

    rnn_params: {
      title: 'Quick Drill · RNN / LSTM / GRU Parameter Count (Lab 11 & Q4)',
      make() {
        const d = pick([16, 32, 64]);
        const h = pick([32, 64, 128]);
        const rnn = h * (d + h + 1);
        const gruStd = 3 * h * (d + h + 1);
        const lstm = 4 * h * (d + h + 1);
        return {
          prompt: `Using the standard <b>1 bias per gate</b> convention, compute cell parameters for input size <b>d = ${d}</b> and hidden size <b>h = ${h}</b>.`,
          fields: [
            { l: 'Vanilla RNN params', a: rnn, tol: 0.5 },
            { l: 'GRU params (1 bias/gate)', a: gruStd, tol: 0.5 },
            { l: 'LSTM params (4 gates)', a: lstm, tol: 0.5 }
          ],
          steps: `<ol>
            <li>Per affine gate = h(d + h + 1) = ${h}×(${d} + ${h} + 1) = <b>${rnn}</b></li>
            <li>Vanilla RNN (1 gate) = <b>${rnn}</b></li>
            <li>GRU (3 gates) = 3 × ${rnn} = <b>${gruStd}</b> (Note: Lab 11's <code>ManualGRUCell</code> uses 2 biases/gate = ${gruStd + 3 * h})</li>
            <li>LSTM (4 gates) = 4 × ${rnn} = <b>${lstm}</b></li>
          </ol>`
        };
      }
    }
  };

  function parseNum(s) {
    const t = String(s).trim().replace('−', '-');
    if (!t) return NaN;
    return Number(t);
  }

  function renderGen(el) {
    const g = GEN[el.dataset.gen];
    if (!g) return;
    let cur = null, st = { ok: 0, tries: 0 };
    el.innerHTML = `
      <div class="gen-head"><span class="label">${g.title}</span><span class="gen-score"></span></div>
      <div class="gen-q"></div><div class="gen-f"></div>
      <div class="gen-btns">
        <button type="button" class="btn" data-a="check">Check</button>
        <button type="button" class="btn ghost" data-a="sol">Show Steps</button>
        <button type="button" class="btn ghost" data-a="new">New Numbers</button>
      </div>
      <div class="gen-msg" aria-live="polite"></div><div class="gen-steps" hidden></div>`;
    const qEl = el.querySelector('.gen-q'), fEl = el.querySelector('.gen-f'),
          mEl = el.querySelector('.gen-msg'), sEl = el.querySelector('.gen-steps'),
          scEl = el.querySelector('.gen-score');
    const score = () => { scEl.textContent = st.tries ? `Score: ${st.ok}/${st.tries}` : 'Work on paper, enter answers'; };
    function fresh() {
      cur = g.make();
      qEl.innerHTML = cur.prompt;
      fEl.innerHTML = cur.fields.map((f, i) => `
        <div class="gen-row">
          <label for="${el.dataset.gen}-${i}">${f.l}</label>
          <input id="${el.dataset.gen}-${i}" inputmode="decimal" autocomplete="off" placeholder="answer">
          <span class="mk" aria-hidden="true"></span>
        </div>`).join('');
      sEl.innerHTML = cur.steps;
      sEl.hidden = true;
      mEl.textContent = '';
      score();
    }
    function check() {
      let all = true;
      cur.fields.forEach((f, i) => {
        const row = fEl.children[i], inp = row.querySelector('input'), mk = row.querySelector('.mk');
        const u = parseNum(inp.value);
        const tol = f.tol !== undefined ? f.tol : Math.max(0.01, 0.008 * Math.abs(f.a));
        const good = !isNaN(u) && Math.abs(u - f.a) <= tol;
        row.classList.toggle('ok', good);
        row.classList.toggle('no', !good);
        mk.textContent = good ? '✓' : '✗';
        if (!good) all = false;
      });
      st.tries++;
      if (all) st.ok++;
      mEl.textContent = all ? 'All correct! Try another with "New Numbers".' : 'Check marked items (✗) or click "Show Steps". Round to 3 decimals.';
      score();
    }
    el.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn || !btn.dataset.a) return;
      if (btn.dataset.a === 'check') check();
      else if (btn.dataset.a === 'sol') sEl.hidden = !sEl.hidden;
      else if (btn.dataset.a === 'new') fresh();
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); check(); }
    });
    fresh();
  }

  document.querySelectorAll('.gen[data-gen]').forEach(renderGen);

  // Flashcards
  document.querySelectorAll('.flash').forEach((card) => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(card.classList.contains('flipped')));
    });
  });

  // Page completion & Home plan persistence
  const done = store.get('dsl501.done', {});
  document.querySelectorAll('input[data-done]').forEach((box) => {
    box.checked = !!done[box.dataset.done];
    box.addEventListener('change', () => {
      done[box.dataset.done] = box.checked;
      store.set('dsl501.done', done);
    });
  });
  document.querySelectorAll('[data-status]').forEach((el) => {
    if (done[el.dataset.status]) el.textContent = '✓ Done';
  });

  const plan = store.get('dsl501.plan', {});
  const planBoxes = [...document.querySelectorAll('#plan-list input[type="checkbox"]')];
  const prog = document.getElementById('plan-progress');
  const updatePlan = () => {
    if (prog) prog.textContent = `· ${planBoxes.filter((b) => b.checked).length}/${planBoxes.length} done`;
  };
  planBoxes.forEach((box) => {
    box.checked = !!plan[box.id];
    box.addEventListener('change', () => {
      plan[box.id] = box.checked;
      store.set('dsl501.plan', plan);
      updatePlan();
    });
  });
  updatePlan();
})();
