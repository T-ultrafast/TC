$path = 'c:\Users\HP\OneDrive - MSFT\Projects\TandC\TC\tclens-web\src\app\app\document\page.tsx'
$content = [System.IO.File]::ReadAllLines($path)

$newContent = New-Object System.Collections.Generic.List[string]

$i = 0
while ($i -lt $content.Count) {
    $line = $content[$i]
    
    # Check for the broken history mapping section (around 1535)
    if ($line -like "*ArrowUpRight*ml-auto*") {
        $newContent.Add($line)
        $newContent.Add("                                                        </div>")
        $newContent.Add("                                                    </div>")
        $newContent.Add("                                                </div>")
        $newContent.Add("                                            ))}")
        $newContent.Add("                                        </div>")
        $newContent.Add("                                    )}")
        $newContent.Add("                                </div>")
        $newContent.Add("                            ) : (")
        
        # Skip the next few broken lines (1536 to 1541)
        # 1536: </div>
        # 1537: )) }
        # 1538: </div>
        # 1539: )}
        # 1540: </div>
        # 1541: ) : (
        $i += 6
    }
    else {
        $newContent.Add($line)
    }
    $i++
}

[System.IO.File]::WriteAllLines($path, $newContent)
