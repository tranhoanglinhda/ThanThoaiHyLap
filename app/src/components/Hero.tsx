export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="kicker">Thần thoại Hy Lạp · Greek Mythology</div>
      <h1>
        PANTHEON<span className="sub">Mười hai vị thần Olympus &amp; dòng dõi thần linh</span>
      </h1>
      <div className="hr-rule"></div>
      <p className="lede">
        Một thư viện điêu khắc tương tác: xoay từng pho tượng, lần theo cây gia phả từ Hư Không
        nguyên thủy đến đỉnh Olympus.
        <br />
        <span style={{ fontStyle: "italic", fontSize: ".9em", opacity: 0.8 }}>
          Rotate each marble, then trace the bloodline from primordial Chaos to the heights of
          Olympus.
        </span>
      </p>
      <div className="scroll-cue">Cuộn để khám phá</div>
    </header>
  );
}
