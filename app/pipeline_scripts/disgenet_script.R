#!/usr/bin/env Rscript
args = commandArgs(trailingOnly=TRUE)
library(parallel)
#files needed
#curated db files
disgenet_db <- FALSE
input_file <- ""
output_path <- ""
gene_db <- "refseq"
#where data files are located
bin_dir <- "/local/datasets/disgenet"

findDiseases <- function(snp) {
    indexes <- which(!is.na(match(curated$snpId, snp)))
    return(curated[indexes, c(1,7,8,11,16)])
}

#get arguments
if (length(args) >= 1) {
  
  if(args[1] == "true"){
    disgenet_db <- TRUE
  }

  input_file <- args[2]
  output_path <- args[3]

  gene_db <- args[4]

#   print(args[1])
#   print(input_file)
#   print(output_path)
  print(gene_db);
}

#remember to change the file separator
input_snps <- read.delim(input_file, header=FALSE)

if(disgenet_db == TRUE){
  curated <- read.delim(paste(bin_dir, "curated_variant_disease_associations.tsv",sep='/'), header = T, stringsAsFactors = F)

  #remember to change to correct column name
#   output <- mclapply(input_snps[,6], findDiseases, mc.cores=2)
  output <- lapply(input_snps[,6], findDiseases)
  df <- do.call("rbind", output)

  #colnames(df) <- c('marker', 'DisGeneNet.disease', 'diseaseType', 'score', 'disease source')
  res <- na.omit(df)

  #write to file
  write.table(res, paste(output_path,'disgenet.txt', sep='/'),sep='\t',row.names=FALSE, quote=F)
}

library(ggplot2)
myanno <- read.csv(paste(output_path, "annotation_output.hg19_multianno.csv", sep="/"))

#write snp column to file
marker_name <- input_snps[,6]
allsnps <- cbind(myanno, marker_name);
write.table(allsnps, paste(output_path,'annotation_output.hg19_multianno_full.tsv', sep='/'),sep='\t',row.names=FALSE, quote=F)

columnName <- paste('Func.', 'refGene', sep='');
if(gene_db == 'ucsc'){
  columnName <- paste('Func.', 'knownGene', sep='');
}else if(gene_db == 'ensembl'){
  columnName <- paste('Func.', 'ensGene', sep='');
}

#plot snp locations
dd <- table(myanno[columnName])

dd <- as.data.frame(dd, stringsAsFactors=F)
dd[dd=='.'] <- 'NA'
dd$Freq <- as.integer(dd$Freq)
colnames(dd) <- c('Group', 'value')

ggplot(dd, aes(x="", y=value, fill=Group)) +
  geom_bar(stat="identity", width=1, color="white") +
  coord_polar("y", start=0) +
  theme(axis.text = element_blank(), axis.ticks = element_blank(),
  panel.background=element_blank(),
  legend.text = element_text(size = 12, face = "bold"),
        panel.grid  = element_blank(),
        axis.title.x=element_blank(),
        axis.text.x=element_blank(),
        axis.ticks.x=element_blank(),
        axis.title.y=element_blank(),
        axis.text.y=element_blank(),
        axis.ticks.y=element_blank())

ggsave(paste(output_path, 'snp_plot.jpg', sep = '/'), units="in", width=5, height=4, dpi=320)

exons <- myanno[which(myanno[columnName] == 'exonic'),]

columnName <- paste('ExonicFunc.', 'refGene', sep='');
if(gene_db == 'ucsc'){
  columnName <- paste('ExonicFunc.', 'knownGene', sep='');
}else if(gene_db == 'ensembl'){
  columnName <- paste('ExonicFunc.', 'ensGene', sep='');
}

data <- table(exons[columnName])
data <- as.data.frame(data, stringsAsFactors=F)
data[data=='.'] <- 'NA'
data$Freq <- as.integer(data$Freq)
colnames(data) <- c('name', 'frequency')
ggplot(data, aes(x=name, y=frequency, fill=name)) +
  geom_bar(stat="identity", color="white", width=0.75) +
   xlab('Exon annotations') +
     guides(fill=guide_legend(title="Exon annotations")) +
    theme(axis.text.x=element_blank())

ggsave(paste(output_path, 'exon_plot.jpg', sep = '/'), units="in", width=5, height=4, dpi=320)