Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "F:\RRC\policydrift\policydrift-news"
WshShell.Run "node scripts/prod-supervisor.mjs", 0, False
