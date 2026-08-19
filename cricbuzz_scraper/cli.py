"""Command Line Interface for Cricbuzz Playwright Live Cricket Scraper."""

import argparse
import asyncio
import json
import sys
from pathlib import Path
from typing import Optional

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text
from rich.layout import Layout

from .models import DetailedLiveMatch, LiveMatchesOverview, MatchState
from .scraper import AsyncCricbuzzScraper, CricbuzzScraper
from .live_monitor import LiveScoreMonitor
from .config import DEFAULT_OUTPUT_DIR
from .logger import get_logger

console = Console(force_terminal=True, legacy_windows=False)
logger = get_logger("cricbuzz.cli")


def render_matches_table(overview: LiveMatchesOverview) -> None:
    """Renders a formatted Rich table for all live, recent, and upcoming matches."""
    console.print("\n[bold cyan]=== CRICBUZZ LIVE CRICKET MATCHES ===[/bold cyan]\n")

    # 1. Live Matches Table
    if overview.live_matches:
        live_table = Table(
            title="[LIVE IN PROGRESS]",
            show_header=True,
            header_style="bold red",
            border_style="red",
            expand=True,
        )
        live_table.add_column("Match ID", style="bold yellow", width=12)
        live_table.add_column("Match Title", style="bold white", ratio=2)
        live_table.add_column("Scores", style="green", ratio=2)
        live_table.add_column("Status / Situation", style="cyan", ratio=2)

        for m in overview.live_matches:
            scores = []
            if m.team1_name and m.team1_score:
                scores.append(f"{m.team1_name}: {m.team1_score}")
            if m.team2_name and m.team2_score:
                scores.append(f"{m.team2_name}: {m.team2_score}")
            score_str = " | ".join(scores) if scores else "Scores loading..."

            live_table.add_row(m.match_id, m.title, score_str, m.status)
        console.print(live_table)
        console.print()

    # 2. Recent Matches Table
    if overview.recent_matches:
        recent_table = Table(
            title="[RECENT MATCHES]",
            show_header=True,
            header_style="bold green",
            border_style="dim green",
            expand=True,
        )
        recent_table.add_column("Match ID", style="yellow", width=12)
        recent_table.add_column("Match Title", style="white", ratio=2)
        recent_table.add_column("Scores", style="dim white", ratio=2)
        recent_table.add_column("Result", style="green", ratio=2)

        for m in overview.recent_matches[:8]:
            scores = []
            if m.team1_name and m.team1_score:
                scores.append(f"{m.team1_name}: {m.team1_score}")
            if m.team2_name and m.team2_score:
                scores.append(f"{m.team2_name}: {m.team2_score}")
            score_str = " | ".join(scores) if scores else "-"

            recent_table.add_row(m.match_id, m.title, score_str, m.status)
        console.print(recent_table)
        console.print()

    # 3. Upcoming Matches Table
    if overview.upcoming_matches:
        up_table = Table(
            title="[UPCOMING MATCHES]",
            show_header=True,
            header_style="bold blue",
            border_style="dim blue",
            expand=True,
        )
        up_table.add_column("Match ID", style="yellow", width=12)
        up_table.add_column("Match Title", style="white", ratio=2)
        up_table.add_column("Series", style="dim cyan", ratio=2)
        up_table.add_column("Schedule", style="blue", ratio=2)

        for m in overview.upcoming_matches[:5]:
            up_table.add_row(m.match_id, m.title, m.series or "-", m.status)
        console.print(up_table)
        console.print()


def render_match_score(match: DetailedLiveMatch) -> None:
    """Renders a rich dashboard for an individual match (live or completed)."""
    # Header panel
    state_color = "red" if match.state == MatchState.LIVE else "green"
    header_text = Text()
    header_text.append(f"{match.title}\n", style="bold white text-lg")
    if match.series:
        header_text.append(f"Series: {match.series}  |  ", style="dim cyan")
    if match.venue:
        header_text.append(f"Venue: {match.venue}\n", style="dim yellow")
    if match.toss:
        header_text.append(f"Toss: {match.toss}\n", style="dim magenta")
    if match.player_of_the_match:
        header_text.append(f"Player of the Match: {match.player_of_the_match}\n", style="bold yellow")

    header_text.append(f"\nStatus: {match.status_text}", style=f"bold {state_color}")

    console.print(Panel(header_text, title=f"[{state_color}]Match #{match.match_id} ({match.state.value})[/{state_color}]", border_style=state_color))

    # 1. Full Scorecard (if available, e.g. completed match or complete innings)
    if match.full_scorecard:
        for inn in match.full_scorecard:
            console.print(f"\n[bold magenta]=== {inn.team_name} Innings - {inn.score_str} ===[/bold magenta]")
            
            # Batsmen table
            if inn.batsmen:
                bat_table = Table(show_header=True, header_style="bold green", expand=True)
                bat_table.add_column("Batter", style="bold white", ratio=2)
                bat_table.add_column("Dismissal", style="dim white", ratio=3)
                bat_table.add_column("R", justify="right", style="bold yellow")
                bat_table.add_column("B", justify="right", style="cyan")
                bat_table.add_column("4s", justify="right", style="dim green")
                bat_table.add_column("6s", justify="right", style="dim magenta")
                bat_table.add_column("SR", justify="right", style="bold white")

                for b in inn.batsmen:
                    bat_table.add_row(
                        b.name,
                        b.out_desc or "-",
                        str(b.runs),
                        str(b.balls),
                        str(b.fours),
                        str(b.sixes),
                        f"{b.strike_rate:.1f}",
                    )
                console.print(bat_table)

            if inn.extras:
                console.print(f"[dim]Extras: {inn.extras}[/dim]")

            # Bowlers table
            if inn.bowlers:
                bowl_table = Table(show_header=True, header_style="bold blue", expand=True)
                bowl_table.add_column("Bowler", style="bold white", ratio=2)
                bowl_table.add_column("O", justify="right", style="cyan")
                bowl_table.add_column("M", justify="right", style="dim white")
                bowl_table.add_column("R", justify="right", style="yellow")
                bowl_table.add_column("W", justify="right", style="bold red")
                bowl_table.add_column("Econ", justify="right", style="white")

                for bw in inn.bowlers:
                    bowl_table.add_row(
                        bw.name,
                        f"{bw.overs:.1f}",
                        str(bw.maidens),
                        str(bw.runs),
                        str(bw.wickets),
                        f"{bw.economy:.2f}",
                    )
                console.print(bowl_table)
    else:
        # 2. Live Innings & Live Batsmen fallback
        if match.innings:
            inn_table = Table(title="Innings Scores", show_header=True, header_style="bold magenta", expand=True)
            inn_table.add_column("Team", style="bold white")
            inn_table.add_column("Score", style="bold yellow")
            inn_table.add_column("Overs", style="cyan")
            inn_table.add_column("Wickets", style="red")

            for inn in match.innings:
                inn_table.add_row(
                    inn.team_name,
                    inn.score_str,
                    str(inn.overs) if inn.overs is not None else "-",
                    str(inn.wickets) if inn.wickets is not None else "-",
                )
            console.print(inn_table)
            console.print()

        if match.current_batsmen:
            bat_table = Table(title="Active Batsmen", show_header=True, header_style="bold green", expand=True)
            bat_table.add_column("Batter", style="bold white")
            bat_table.add_column("R", justify="right", style="bold yellow")
            bat_table.add_column("B", justify="right", style="cyan")
            bat_table.add_column("4s", justify="right", style="dim green")
            bat_table.add_column("6s", justify="right", style="dim magenta")
            bat_table.add_column("SR", justify="right", style="bold white")

            for b in match.current_batsmen:
                name_display = f"{b.name} *" if b.is_striker else b.name
                bat_table.add_row(name_display, str(b.runs), str(b.balls), str(b.fours), str(b.sixes), f"{b.strike_rate:.1f}")
            console.print(bat_table)
            console.print()

        if match.current_bowlers:
            bowl_table = Table(title="Current Bowlers", show_header=True, header_style="bold blue", expand=True)
            bowl_table.add_column("Bowler", style="bold white")
            bowl_table.add_column("O", justify="right", style="cyan")
            bowl_table.add_column("M", justify="right", style="dim white")
            bowl_table.add_column("R", justify="right", style="yellow")
            bowl_table.add_column("W", justify="right", style="bold red")
            bowl_table.add_column("Econ", justify="right", style="white")

            for bw in match.current_bowlers:
                bowl_table.add_row(bw.name, f"{bw.overs:.1f}", str(bw.maidens), str(bw.runs), str(bw.wickets), f"{bw.economy:.2f}")
            console.print(bowl_table)
            console.print()

    # Situational Metrics
    meta_info = []
    if match.crr is not None:
        meta_info.append(f"[bold cyan]CRR:[/bold cyan] {match.crr}")
    if match.rrr is not None:
        meta_info.append(f"[bold red]RRR:[/bold red] {match.rrr}")
    if match.target is not None:
        meta_info.append(f"[bold yellow]Target:[/bold yellow] {match.target}")
    if match.partnership:
        meta_info.append(f"[bold magenta]Partnership:[/bold magenta] {match.partnership}")
    if match.last_wicket:
        meta_info.append(f"[bold red]Last Wkt:[/bold red] {match.last_wicket}")
    if match.recent_overs:
        meta_info.append(f"[bold green]Recent:[/bold green] {match.recent_overs}")

    if meta_info:
        console.print(Panel("  |  ".join(meta_info), title="Match Telemetry", border_style="cyan"))

    # Recent commentary
    if match.recent_commentary:
        console.print("\n[bold white]> Commentary Snippets:[/bold white]")
        for comm in match.recent_commentary[:4]:
            console.print(f" * [dim white]{comm}[/dim white]")
    console.print()


def cmd_list(args):
    """List all cricket matches."""
    console.print("[bold yellow]Fetching live matches from Cricbuzz via Playwright...[/bold yellow]")
    scraper = CricbuzzScraper(headless=not args.headful)
    overview = scraper.get_live_matches()
    render_matches_table(overview)

    if args.json:
        console.print_json(overview.model_dump_json())


def cmd_recent(args):
    """List recently completed cricket matches."""
    console.print("[bold yellow]Fetching recent/completed matches from Cricbuzz via Playwright...[/bold yellow]")
    scraper = CricbuzzScraper(headless=not args.headful)
    overview = scraper.get_recent_matches()
    render_matches_table(overview)

    if args.json:
        console.print_json(overview.model_dump_json())


def cmd_score(args):
    """Fetch live or completed match score details for a specific match ID or URL."""
    console.print(f"[bold yellow]Fetching scorecard for Match {args.match_id}...[/bold yellow]")
    scraper = CricbuzzScraper(headless=not args.headful)
    match_data = scraper.get_match_score(args.match_id)
    render_match_score(match_data)

    if args.json:
        console.print_json(match_data.model_dump_json())

    if args.output:
        out_path = Path(args.output)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(match_data.model_dump_json(indent=2))
        console.print(f"[bold green][OK] Match data exported to {out_path.resolve()}[/bold green]")


def cmd_watch(args):
    """Continuously monitor and stream live scores."""
    console.print(f"[bold yellow]Starting real-time live score monitor for Match {args.match_id} (interval={args.interval}s)...[/bold yellow]")
    console.print("[dim]Press Ctrl+C to stop monitoring.[/dim]\n")

    def handle_update(curr: DetailedLiveMatch, prev: Optional[DetailedLiveMatch]):
        console.clear()
        render_match_score(curr)

    monitor = LiveScoreMonitor(
        match_id=args.match_id,
        poll_interval=args.interval,
        on_update=handle_update,
    )

    try:
        asyncio.run(monitor.start())
    except KeyboardInterrupt:
        monitor.stop()
        console.print("\n[bold yellow]Monitoring stopped by user.[/bold yellow]")


def cmd_football_overview(args):
    """Fetch football matches from Tribuna."""
    from .football_scraper import AsyncTribunaFootballScraper

    console.print("[bold yellow]Fetching live & today football matches from Tribuna.com...[/bold yellow]")
    async def _fetch():
        async with AsyncTribunaFootballScraper(headless=True) as scraper:
            return await scraper.get_overview()

    overview = asyncio.run(_fetch())

    console.print("\n[bold cyan]=== TRIBUNA LIVE FOOTBALL MATCHES ===[/bold cyan]\n")

    if overview.live_matches:
        live_table = Table(
            title="[LIVE FOOTBALL]",
            show_header=True,
            header_style="bold red",
            border_style="red",
            expand=True,
        )
        live_table.add_column("Match ID", style="bold yellow", width=25)
        live_table.add_column("League", style="magenta", width=18)
        live_table.add_column("Matchup", style="bold white", ratio=2)
        live_table.add_column("Score", style="bold green", width=10)
        live_table.add_column("Minute / Status", style="cyan", width=15)

        for m in overview.live_matches:
            score = f"{m.home_score} - {m.away_score}" if m.home_score is not None else "vs"
            live_table.add_row(m.match_id, m.league, f"{m.home_team} vs {m.away_team}", score, m.status_text)
        console.print(live_table)

    if overview.recent_matches:
        rec_table = Table(
            title="[RECENT / COMPLETED FOOTBALL]",
            show_header=True,
            header_style="bold green",
            border_style="green",
            expand=True,
        )
        rec_table.add_column("Match ID", style="bold yellow", width=25)
        rec_table.add_column("League", style="magenta", width=18)
        rec_table.add_column("Matchup", style="bold white", ratio=2)
        rec_table.add_column("Score", style="bold green", width=10)
        rec_table.add_column("Status", style="green", width=12)

        for m in overview.recent_matches[:10]:
            score = f"{m.home_score} - {m.away_score}" if m.home_score is not None else "FT"
            rec_table.add_row(m.match_id, m.league, f"{m.home_team} vs {m.away_team}", score, m.status_text)
        console.print(rec_table)

    if args.json:
        console.print_json(overview.model_dump_json())

    if args.output:
        out_path = Path(args.output)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(overview.model_dump_json(indent=2))
        console.print(f"[bold green][OK] Football overview exported to {out_path.resolve()}[/bold green]")


def cmd_football_match(args):
    """Fetch individual football match details."""
    from .football_scraper import AsyncTribunaFootballScraper

    console.print(f"[bold yellow]Fetching football match details for {args.match_id} from Tribuna...[/bold yellow]")
    async def _fetch():
        async with AsyncTribunaFootballScraper(headless=True) as scraper:
            return await scraper.get_match_details(args.match_id)

    details = asyncio.run(_fetch())
    if not details:
        console.print("[bold red]Failed to load match details.[/bold red]")
        return

    console.print(Panel(
        f"[bold white]{details.home_team} {details.home_score or 0} - {details.away_score or 0} {details.away_team}[/bold white]\n"
        f"[cyan]League:[/cyan] {details.league}  |  [yellow]Status:[/yellow] {details.status_text}\n"
        f"[dim]{details.match_url}[/dim]",
        title="Football Match Details",
        border_style="green",
    ))

    if args.json:
        console.print_json(details.model_dump_json())

    if args.output:
        out_path = Path(args.output)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(details.model_dump_json(indent=2))
        console.print(f"[bold green][OK] Match details exported to {out_path.resolve()}[/bold green]")


def cmd_hub(args):
    """Run unified sports background daemon (Cricket + Football concurrently)."""
    from .hub import UnifiedSportsHubService

    console.print("[bold green]Starting Unified Sports Hub Daemon (Cricket: Cricbuzz + Football: Tribuna)...[/bold green]")
    console.print("[dim]Press Ctrl+C to gracefully stop.[/dim]\n")

    hub = UnifiedSportsHubService(
        cricket_poll_interval=args.cricket_interval,
        football_poll_interval=args.football_interval,
    )

    try:
        asyncio.run(hub.start())
    except (KeyboardInterrupt, asyncio.CancelledError):
        hub.stop()
        console.print("\n[bold yellow]Unified Sports Hub stopped by user.[/bold yellow]")


def main():
    """Main CLI entrypoint."""
    parser = argparse.ArgumentParser(
        description="Unified Sports Scraper (Cricket & Football)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Command: list (Cricket)
    list_parser = subparsers.add_parser("list", help="List all ongoing, recent, and upcoming cricket matches")
    list_parser.add_argument("--json", action="store_true", help="Output raw JSON to stdout")
    list_parser.add_argument("--headful", action="store_true", help="Run browser in visible mode")

    # Command: recent (Cricket)
    recent_parser = subparsers.add_parser("recent", help="List all recently completed cricket matches")
    recent_parser.add_argument("--json", action="store_true", help="Output raw JSON to stdout")
    recent_parser.add_argument("--headful", action="store_true", help="Run browser in visible mode")

    # Command: score (Cricket)
    score_parser = subparsers.add_parser("score", help="Fetch detailed scorecard for a cricket match")
    score_parser.add_argument("match_id", type=str, help="Cricbuzz Match ID or full URL")
    score_parser.add_argument("--json", action="store_true", help="Output raw JSON to stdout")
    score_parser.add_argument("-o", "--output", type=str, help="Output JSON file path")
    score_parser.add_argument("--headful", action="store_true", help="Run browser in visible mode")

    # Command: watch (Cricket)
    watch_parser = subparsers.add_parser("watch", help="Watch live cricket match in real-time")
    watch_parser.add_argument("match_id", type=str, help="Cricbuzz Match ID to monitor")
    watch_parser.add_argument("-i", "--interval", type=float, default=6.0, help="Polling interval in seconds (default: 6)")

    # Command: football (Football Overview from Tribuna)
    fb_parser = subparsers.add_parser("football", help="Fetch live & today football matches from Tribuna.com")
    fb_parser.add_argument("--json", action="store_true", help="Output raw JSON to stdout")
    fb_parser.add_argument("-o", "--output", type=str, help="Output JSON file path")
    fb_parser.add_argument("--headful", action="store_true", help="Run browser in visible mode")

    # Command: football-match (Football Match Details from Tribuna)
    fbm_parser = subparsers.add_parser("football-match", help="Fetch football match details from Tribuna.com")
    fbm_parser.add_argument("match_id", type=str, help="Tribuna Match ID or URL")
    fbm_parser.add_argument("--json", action="store_true", help="Output raw JSON to stdout")
    fbm_parser.add_argument("-o", "--output", type=str, help="Output JSON file path")
    fbm_parser.add_argument("--headful", action="store_true", help="Run browser in visible mode")

    # Command: hub (Unified Background Daemon for both Cricket + Football)
    hub_parser = subparsers.add_parser("hub", help="Run unified background sports hub (Cricket + Football concurrently)")
    hub_parser.add_argument("--cricket-interval", type=float, default=5.0, help="Cricket live polling interval in seconds")
    hub_parser.add_argument("--football-interval", type=float, default=15.0, help="Football polling interval in seconds")

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        sys.exit(1)

    if args.command == "list":
        cmd_list(args)
    elif args.command == "recent":
        cmd_recent(args)
    elif args.command == "score":
        cmd_score(args)
    elif args.command == "watch":
        cmd_watch(args)
    elif args.command == "football":
        cmd_football_overview(args)
    elif args.command == "football-match":
        cmd_football_match(args)
    elif args.command == "hub":
        cmd_hub(args)


if __name__ == "__main__":
    main()

