#!/bin/bash
# Line 429: Change <Card to <Box
sed -i.bak1 '429s/<Card/<Box/' PreflightAuditSidePanel.tsx
# Line 433: Add after color="fg.default"
sed -i.bak2 '433s/color="fg.default"/color="fg.default"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\trounded="md"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tborder="1"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tborderColor="border.default"/' PreflightAuditSidePanel.tsx
# Line 436: Change </Card> to </Box>
sed -i.bak3 '436s/<\/Card>/<\/Box>/' PreflightAuditSidePanel.tsx
# Line 449: Change <Card to <Box  
sed -i.bak4 '449s/<Card/<Box/' PreflightAuditSidePanel.tsx
# Line 454: Add after color="fg.default"
sed -i.bak5 '454s/color="fg.default"/color="fg.default"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\trounded="md"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tborder="1"\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\tborderColor="border.default"/' PreflightAuditSidePanel.tsx
# Line 457: Change </Card> to </Box>
sed -i.bak6 '457s/<\/Card>/<\/Box>/' PreflightAuditSidePanel.tsx
